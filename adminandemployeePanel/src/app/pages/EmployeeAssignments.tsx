import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useGetAdminUsersQuery } from "../features/adminUsers/adminUsersApi";
import type { AdminUser } from "../features/adminUsers/adminUsersTypes";
import { getRoleLabel, isActiveStatus } from "../features/adminUsers/adminUsersUtils";
import {
  useActivateAdminAssignmentMutation,
  useCreateAdminAssignmentMutation,
  useDeactivateAdminAssignmentMutation,
  useGetAdminAssignmentsQuery,
  useUpdateAdminAssignmentMutation,
} from "../features/adminAssignments/adminAssignmentsApi";
import type {
  AdminAssignment,
  AdminAssignmentsListQuery,
  AdminAssignmentScope,
  CreateAdminAssignmentRequest,
} from "../features/adminAssignments/adminAssignmentsTypes";
import {
  ADMIN_ASSIGNMENT_SCOPE_OPTIONS,
  extractApiErrorMessage,
  formatAssignmentDateTime,
  getAssignmentEmployeeName,
  getAssignmentScopeBadgeClass,
  getAssignmentScopeLabel,
  getAssignmentStatusBadgeClass,
  getAssignmentStatusLabel,
} from "../features/adminAssignments/adminAssignmentsUtils";
import { useGetClientsQuery } from "../features/clients/clientsApi";
import type { ClientProfile, ClientsListQuery } from "../features/clients/clientsTypes";
import { shortId } from "../features/clients/clientsUtils";
import {
  hasAdminPermission,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import { useAppSelector } from "../store/hooks";

const SEARCH_DEBOUNCE_MS = 275;
const PICKER_LIMIT = 8;

type AssignmentScopeFilter = AdminAssignmentScope | "ALL";
type AssignmentStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type PendingAssignmentStatusAction = "activate" | "deactivate";

type CreateAssignmentFormState = {
  employee: AdminUser | null;
  client: ClientProfile | null;
  scope: AdminAssignmentScope;
};

const initialCreateForm: CreateAssignmentFormState = {
  employee: null,
  client: null,
  scope: "PROJECT",
};

export function EmployeeAssignments() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadAssignments = hasAdminPermission(currentUser, ["assignments.read"]);
  const canManageAssignments = hasAdminPermission(currentUser, ["assignments.manage"]);

  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<AdminUser | null>(null);
  const [selectedClientFilter, setSelectedClientFilter] = useState<ClientProfile | null>(null);
  const [scopeFilter, setScopeFilter] = useState<AssignmentScopeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<AssignmentStatusFilter>("ALL");

  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateAssignmentFormState>(initialCreateForm);
  const [createSubmitError, setCreateSubmitError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<AdminAssignment | null>(null);
  const [editScope, setEditScope] = useState<AdminAssignmentScope>("PROJECT");
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  const [statusActionTarget, setStatusActionTarget] = useState<{
    assignment: AdminAssignment;
    action: PendingAssignmentStatusAction;
  } | null>(null);
  const [statusSubmitError, setStatusSubmitError] = useState<string | null>(null);

  const assignmentsQuery = useMemo<AdminAssignmentsListQuery>(
    () => ({
      employeeUserId: selectedEmployeeFilter?.id,
      clientProfileId: selectedClientFilter?.id,
      scope: scopeFilter === "ALL" ? undefined : scopeFilter,
      isActive: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
    }),
    [scopeFilter, selectedClientFilter?.id, selectedEmployeeFilter?.id, statusFilter],
  );

  const {
    data: assignmentsResponse,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminAssignmentsQuery(assignmentsQuery, { skip: !canReadAssignments });

  const [createAdminAssignment, { isLoading: isCreating }] =
    useCreateAdminAssignmentMutation();
  const [updateAdminAssignment, { isLoading: isUpdating }] =
    useUpdateAdminAssignmentMutation();
  const [deactivateAdminAssignment, { isLoading: isDeactivating }] =
    useDeactivateAdminAssignmentMutation();
  const [activateAdminAssignment, { isLoading: isActivating }] =
    useActivateAdminAssignmentMutation();

  const assignments = assignmentsResponse ?? [];
  const activeCount = assignments.filter((assignment) => assignment.isActive).length;
  const inactiveCount = assignments.length - activeCount;
  const hasActiveFilters =
    Boolean(selectedEmployeeFilter) ||
    Boolean(selectedClientFilter) ||
    scopeFilter !== "ALL" ||
    statusFilter !== "ALL";
  const isMutating = isCreating || isUpdating || isDeactivating || isActivating;

  function resetCreateForm() {
    setCreateForm(initialCreateForm);
    setCreateSubmitError(null);
  }

  function openCreateDialog() {
    setPageError(null);
    setPageSuccess(null);
    resetCreateForm();
    setIsCreateOpen(true);
  }

  function closeCreateDialog() {
    setIsCreateOpen(false);
    resetCreateForm();
  }

  function openEditDialog(assignment: AdminAssignment) {
    setPageError(null);
    setPageSuccess(null);
    setEditSubmitError(null);
    setEditTarget(assignment);
    setEditScope(assignment.scope);
  }

  function closeEditDialog() {
    setEditTarget(null);
    setEditSubmitError(null);
  }

  function openStatusDialog(assignment: AdminAssignment) {
    setPageError(null);
    setPageSuccess(null);
    setStatusSubmitError(null);
    setStatusActionTarget({
      assignment,
      action: assignment.isActive ? "deactivate" : "activate",
    });
  }

  function closeStatusDialog() {
    setStatusActionTarget(null);
    setStatusSubmitError(null);
  }

  function clearFilters() {
    setSelectedEmployeeFilter(null);
    setSelectedClientFilter(null);
    setScopeFilter("ALL");
    setStatusFilter("ALL");
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreating) {
      return;
    }

    setCreateSubmitError(null);
    setPageError(null);
    setPageSuccess(null);

    if (!createForm.employee || !createForm.client) {
      setCreateSubmitError("Çalışan ve müşteri seçimi gereklidir.");
      return;
    }

    const payload: CreateAdminAssignmentRequest = {
      employeeUserId: createForm.employee.id,
      clientProfileId: createForm.client.id,
      scope: createForm.scope,
    };

    try {
      await createAdminAssignment(payload).unwrap();
      closeCreateDialog();
      setPageSuccess("Çalışan ataması başarıyla oluşturuldu.");
    } catch (error) {
      setCreateSubmitError(
        extractApiErrorMessage(error, "Çalışan ataması oluşturulamadı."),
      );
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editTarget || isUpdating) {
      return;
    }

    setEditSubmitError(null);
    setPageError(null);
    setPageSuccess(null);

    try {
      await updateAdminAssignment({
        id: editTarget.id,
        body: { scope: editScope },
      }).unwrap();
      closeEditDialog();
      setPageSuccess("Atama kapsamı güncellendi.");
    } catch (error) {
      setEditSubmitError(
        extractApiErrorMessage(error, "Atama kapsamı güncellenemedi."),
      );
    }
  }

  async function handleStatusActionConfirm() {
    if (!statusActionTarget || isDeactivating || isActivating) {
      return;
    }

    setStatusSubmitError(null);
    setPageError(null);
    setPageSuccess(null);

    const { assignment, action } = statusActionTarget;

    try {
      if (action === "deactivate") {
        await deactivateAdminAssignment(assignment.id).unwrap();
        setPageSuccess("Atama pasif duruma alındı.");
      } else {
        await activateAdminAssignment(assignment.id).unwrap();
        setPageSuccess("Atama tekrar aktif edildi.");
      }
      closeStatusDialog();
    } catch (error) {
      setStatusSubmitError(
        extractApiErrorMessage(
          error,
          action === "deactivate"
            ? "Pasife alma işlemi başarısız oldu."
            : "Aktifleştirme işlemi başarısız oldu.",
        ),
      );
    }
  }

  if (!canReadAssignments) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfaya erişim yetkiniz bulunmuyor.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Çalışan Atamaları</h1>
          <p className="text-sm text-[#A0A0A0]">
            Çalışan-müşteri kapsamlarını Admin Assignments API üzerinden yönetin
          </p>
        </div>
        <Button
          type="button"
          className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          onClick={openCreateDialog}
          disabled={!canManageAssignments || isMutating}
          title={
            canManageAssignments ? undefined : "Bu işlem için atama yönetim yetkisi gerekir."
          }
        >
          <Plus className="h-4 w-4" />
          Yeni Atama
        </Button>
      </div>

      {pageError && (
        <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {pageError}
        </Card>
      )}

      {pageSuccess && (
        <Card className="border-[#AAFF01]/30 bg-[#AAFF01]/10 p-4 text-sm text-[#d2ff8a]">
          {pageSuccess}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Listelenen Atama"
          value={isLoading || isListError ? "—" : String(assignments.length)}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Aktif"
          value={isLoading || isListError ? "—" : String(activeCount)}
        />
        <MetricCard
          icon={<ShieldAlert className="h-5 w-5" />}
          label="Pasif"
          value={isLoading || isListError ? "—" : String(inactiveCount)}
        />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,1fr)_minmax(240px,1fr)_160px_140px_auto]">
          <EmployeePicker
            idPrefix="assignment-filter-employee"
            label="Çalışan filtresi"
            selectedEmployee={selectedEmployeeFilter}
            onSelect={setSelectedEmployeeFilter}
            onClear={() => setSelectedEmployeeFilter(null)}
          />
          <ClientPicker
            idPrefix="assignment-filter-client"
            label="Müşteri filtresi"
            selectedClient={selectedClientFilter}
            onSelect={setSelectedClientFilter}
            onClear={() => setSelectedClientFilter(null)}
          />
          <FilterSelect
            label="Kapsam filtresi"
            value={scopeFilter}
            onChange={(value) => setScopeFilter(value as AssignmentScopeFilter)}
          >
            <option value="ALL">Tüm Kapsamlar</option>
            {ADMIN_ASSIGNMENT_SCOPE_OPTIONS.map((scope) => (
              <option key={scope} value={scope}>
                {getAssignmentScopeLabel(scope)}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Durum filtresi"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as AssignmentStatusFilter)}
          >
            <option value="ALL">Tümü</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Pasif</option>
          </FilterSelect>
          <div className="flex items-end gap-2">
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Temizle
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>
      </Card>

      {isLoading && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Atamalar yükleniyor...
        </Card>
      )}

      {isListError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(listError, "Atama listesi alınamadı.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {!isLoading && !isListError && assignments.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          {hasActiveFilters
            ? "Filtrelere uygun atama bulunamadı."
            : "Henüz çalışan ataması bulunmuyor."}
        </Card>
      )}

      {!isLoading && !isListError && assignments.length > 0 && (
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Çalışan</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Kapsam</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Durum</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Güncelleme</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Kayıt ID</th>
                  <th className="p-4 text-right text-sm font-medium text-[#A0A0A0]">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  const nextStatusAction = assignment.isActive ? "deactivate" : "activate";

                  return (
                    <tr
                      key={assignment.id}
                      className="border-t border-white/[0.06] transition-colors hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div className="font-medium text-white">
                          {getAssignmentEmployeeName(assignment)}
                        </div>
                        <div className="text-xs text-[#A0A0A0]">{assignment.employee.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{assignment.client.name}</div>
                        <Badge variant="outline" className="mt-1 font-mono text-xs">
                          {assignment.client.slug}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getAssignmentScopeBadgeClass(assignment.scope)}>
                          {getAssignmentScopeLabel(assignment.scope)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getAssignmentStatusBadgeClass(assignment.isActive)}>
                          {getAssignmentStatusLabel(assignment.isActive)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[#A0A0A0]">
                        {formatAssignmentDateTime(assignment.updatedAt)}
                      </td>
                      <td className="p-4 font-mono text-sm text-[#A0A0A0]">
                        {shortId(assignment.id)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openEditDialog(assignment)}
                            disabled={!canManageAssignments || isMutating}
                            title={
                              canManageAssignments
                                ? undefined
                                : "Bu işlem için atama yönetim yetkisi gerekir."
                            }
                          >
                            <Edit className="h-4 w-4" />
                            Kapsamı Düzenle
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={nextStatusAction === "deactivate" ? "destructive" : "outline"}
                            className="gap-2"
                            onClick={() => openStatusDialog(assignment)}
                            disabled={!canManageAssignments || isMutating}
                            title={
                              canManageAssignments
                                ? undefined
                                : "Bu işlem için atama yönetim yetkisi gerekir."
                            }
                          >
                            {nextStatusAction === "deactivate" ? (
                              <PauseCircle className="h-4 w-4" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                            {nextStatusAction === "deactivate" ? "Pasife Al" : "Aktifleştir"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isFetching && !isLoading && (
            <div className="border-t border-white/[0.06] px-4 py-3 text-sm text-[#d2ff8a]">
              Liste güncelleniyor...
            </div>
          )}
        </Card>
      )}

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCreateDialog();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Yeni Çalışan Ataması</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Aktif çalışan ve aktif müşteri profili için kapsam seçin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
            {createSubmitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {createSubmitError}
              </div>
            )}
            <EmployeePicker
              idPrefix="assignment-create-employee"
              label="Çalışan"
              selectedEmployee={createForm.employee}
              onSelect={(employee) =>
                setCreateForm((prev) => ({ ...prev, employee }))
              }
              onClear={() => setCreateForm((prev) => ({ ...prev, employee: null }))}
              disabled={isCreating}
            />
            <ClientPicker
              idPrefix="assignment-create-client"
              label="Müşteri"
              selectedClient={createForm.client}
              onSelect={(client) => setCreateForm((prev) => ({ ...prev, client }))}
              onClear={() => setCreateForm((prev) => ({ ...prev, client: null }))}
              disabled={isCreating}
            />
            <FilterSelect
              label="Kapsam"
              value={createForm.scope}
              onChange={(value) =>
                setCreateForm((prev) => ({
                  ...prev,
                  scope: value as AdminAssignmentScope,
                }))
              }
              disabled={isCreating}
            >
              {ADMIN_ASSIGNMENT_SCOPE_OPTIONS.map((scope) => (
                <option key={scope} value={scope}>
                  {getAssignmentScopeLabel(scope)}
                </option>
              ))}
            </FilterSelect>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateDialog} disabled={isCreating}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isCreating}
              >
                {isCreating ? "Kaydediliyor..." : "Atama Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Atama Kapsamını Güncelle</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              {editTarget
                ? `${getAssignmentEmployeeName(editTarget)} - ${editTarget.client.name}`
                : "Seçili atama"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editSubmitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {editSubmitError}
              </div>
            )}
            <FilterSelect
              label="Kapsam"
              value={editScope}
              onChange={(value) => setEditScope(value as AdminAssignmentScope)}
              disabled={isUpdating}
            >
              {ADMIN_ASSIGNMENT_SCOPE_OPTIONS.map((scope) => (
                <option key={scope} value={scope}>
                  {getAssignmentScopeLabel(scope)}
                </option>
              ))}
            </FilterSelect>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog} disabled={isUpdating}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isUpdating}
              >
                {isUpdating ? "Kaydediliyor..." : "Kapsamı Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(statusActionTarget)}
        onOpenChange={(open) => {
          if (!open) {
            closeStatusDialog();
          }
        }}
      >
        <DialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>
              {statusActionTarget?.action === "deactivate"
                ? "Atamayı Pasife Al"
                : "Atamayı Aktifleştir"}
            </DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              {statusActionTarget
                ? `${getAssignmentEmployeeName(statusActionTarget.assignment)} - ${statusActionTarget.assignment.client.name}`
                : "Seçili atama"}{" "}
              için durum değişikliği uygulanacaktır.
            </DialogDescription>
          </DialogHeader>
          {statusSubmitError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {statusSubmitError}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeStatusDialog}
              disabled={isDeactivating || isActivating}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              variant={statusActionTarget?.action === "deactivate" ? "destructive" : "default"}
              className={
                statusActionTarget?.action === "activate"
                  ? "bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                  : undefined
              }
              onClick={() => void handleStatusActionConfirm()}
              disabled={isDeactivating || isActivating}
            >
              {isDeactivating || isActivating
                ? "Uygulanıyor..."
                : statusActionTarget?.action === "deactivate"
                  ? "Pasife Al"
                  : "Aktifleştir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-2 text-[#A0A0A0]">
        <span className="text-[#AAFF01]">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </Card>
  );
}

function EmployeePicker({
  idPrefix,
  label,
  selectedEmployee,
  onSelect,
  onClear,
  disabled = false,
}: {
  idPrefix: string;
  label: string;
  selectedEmployee: AdminUser | null;
  onSelect: (employee: AdminUser) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const employeeQuery = useMemo(
    () => ({
      accountType: "EMPLOYEE" as const,
      isActive: true,
      limit: PICKER_LIMIT,
      search: search.length > 0 ? search : undefined,
    }),
    [search],
  );

  const {
    data: employeesResponse,
    error: employeesError,
    isError: isEmployeesError,
    isFetching: isEmployeesFetching,
    isLoading: isEmployeesLoading,
    refetch,
  } = useGetAdminUsersQuery(employeeQuery);

  const employees = (employeesResponse?.data ?? []).filter(
    (employee) => employee.accountType === "EMPLOYEE" && isActiveStatus(employee.status),
  );

  return (
    <div className="space-y-3">
      <PickerSearchInput
        id={`${idPrefix}-search`}
        label={label}
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Çalışan adı veya e-posta ara..."
        disabled={disabled}
      />
      {selectedEmployee && (
        <SelectedPill
          label="Seçili çalışan"
          title={formatEmployeeDisplayName(selectedEmployee)}
          subtitle={selectedEmployee.email}
          onClear={onClear}
          disabled={disabled}
        />
      )}
      <PickerList
        title="Aktif çalışanlar"
        isLoading={isEmployeesLoading}
        isFetching={isEmployeesFetching}
        isError={isEmployeesError}
        errorText={extractApiErrorMessage(employeesError, "Çalışanlar alınamadı.")}
        onRetry={() => refetch()}
        emptyText={
          search.length > 0
            ? "Aramaya uygun çalışan bulunamadı."
            : "Aktif çalışan bulunamadı."
        }
      >
        {employees.map((employee) => {
          const isSelected = selectedEmployee?.id === employee.id;

          return (
            <button
              key={employee.id}
              type="button"
              className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected ? "bg-[#AAFF01]/10" : ""
              }`}
              onClick={() => onSelect(employee)}
              disabled={disabled}
              aria-label={`Çalışanı seç: ${formatEmployeeDisplayName(employee)} ${employee.email}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">
                  {formatEmployeeDisplayName(employee)}
                </span>
                <span className="block truncate text-xs text-[#A0A0A0]">
                  {employee.email} · {getRoleLabel(employee.role)}
                </span>
              </span>
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={isSelected ? "bg-[#AAFF01] text-[#131313]" : undefined}
              >
                {isSelected ? "Seçili" : "Seç"}
              </Badge>
            </button>
          );
        })}
      </PickerList>
    </div>
  );
}

function ClientPicker({
  idPrefix,
  label,
  selectedClient,
  onSelect,
  onClear,
  disabled = false,
}: {
  idPrefix: string;
  label: string;
  selectedClient: ClientProfile | null;
  onSelect: (client: ClientProfile) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const clientsQuery = useMemo<ClientsListQuery>(
    () => ({
      status: "ACTIVE",
      limit: PICKER_LIMIT,
      search: search.length > 0 ? search : undefined,
    }),
    [search],
  );

  const {
    data: clientsResponse,
    error: clientsError,
    isError: isClientsError,
    isFetching: isClientsFetching,
    isLoading: isClientsLoading,
    refetch,
  } = useGetClientsQuery(clientsQuery);

  const clients = (clientsResponse?.data ?? []).filter((client) => client.status === "ACTIVE");

  return (
    <div className="space-y-3">
      <PickerSearchInput
        id={`${idPrefix}-search`}
        label={label}
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Müşteri adı veya slug ara..."
        disabled={disabled}
      />
      {selectedClient && (
        <SelectedPill
          label="Seçili müşteri"
          title={selectedClient.companyName}
          subtitle={selectedClient.slug}
          onClear={onClear}
          disabled={disabled}
        />
      )}
      <PickerList
        title="Aktif müşteriler"
        isLoading={isClientsLoading}
        isFetching={isClientsFetching}
        isError={isClientsError}
        errorText={extractApiErrorMessage(clientsError, "Müşteriler alınamadı.")}
        onRetry={() => refetch()}
        emptyText={
          search.length > 0
            ? "Aramaya uygun müşteri bulunamadı."
            : "Aktif müşteri bulunamadı."
        }
      >
        {clients.map((client) => {
          const isSelected = selectedClient?.id === client.id;

          return (
            <button
              key={client.id}
              type="button"
              className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected ? "bg-[#AAFF01]/10" : ""
              }`}
              onClick={() => onSelect(client)}
              disabled={disabled}
              aria-label={`Müşteriyi seç: ${client.companyName} ${client.slug}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">
                  {client.companyName}
                </span>
                <span className="block truncate text-xs text-[#A0A0A0]">{client.slug}</span>
              </span>
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={isSelected ? "bg-[#AAFF01] text-[#131313]" : undefined}
              >
                {isSelected ? "Seçili" : "Seç"}
              </Badge>
            </button>
          );
        })}
      </PickerList>
    </div>
  );
}

function PickerSearchInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-[#A0A0A0]">
        {label}
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="border-white/[0.08] bg-[#202020] pl-10 text-white"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function SelectedPill({
  label,
  title,
  subtitle,
  onClear,
  disabled,
}: {
  label: string;
  title: string;
  subtitle: string;
  onClear: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-[#AAFF01] text-[#131313]">{label}</Badge>
          <span className="truncate text-sm font-medium text-white">{title}</span>
        </div>
        <p className="mt-1 truncate text-xs text-[#d2ff8a]">{subtitle}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1 text-[#d2ff8a]"
        onClick={onClear}
        disabled={disabled}
      >
        <X className="h-3 w-3" />
        Seçimi Temizle
      </Button>
    </div>
  );
}

function PickerList({
  title,
  isLoading,
  isFetching,
  isError,
  errorText,
  onRetry,
  emptyText,
  children,
}: {
  title: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorText: string;
  onRetry: () => void;
  emptyText: string;
  children: ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#202020]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 text-xs text-[#A0A0A0]">
        <span>{title}</span>
        {isFetching && !isLoading && <span>Güncelleniyor...</span>}
      </div>
      {isLoading && <div className="px-3 py-4 text-sm text-[#A0A0A0]">Yükleniyor...</div>}
      {!isLoading && isError && (
        <div className="space-y-3 px-3 py-4 text-sm text-red-200">
          <p>{errorText}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Tekrar Dene
          </Button>
        </div>
      )}
      {!isLoading && !isError && !hasChildren && (
        <div className="px-3 py-4 text-sm text-[#A0A0A0]">{emptyText}</div>
      )}
      {!isLoading && !isError && hasChildren && (
        <div className="max-h-56 divide-y divide-white/[0.06] overflow-y-auto">{children}</div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const id = `${label.toLowerCase().replace(/\s+/g, "-")}-select`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-[#A0A0A0]">
        {label}
      </Label>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-10 w-full rounded-md border border-white/[0.06] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}

function formatEmployeeDisplayName(employee: AdminUser): string {
  const displayName = employee.displayName?.trim();

  return displayName && displayName.length > 0 ? displayName : employee.email;
}
