import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Search, ShieldAlert, UserCheck, UserCog, Users } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useAppSelector } from "../store/hooks";
import { selectCurrentUser } from "../features/auth/authSelectors";
import type { UserRole } from "../features/auth/authTypes";
import {
  useActivateAdminUserMutation,
  useCreateAdminUserMutation,
  useDeactivateAdminUserMutation,
  useGetAdminUsersQuery,
  useResetAdminUserPasswordMutation,
  useUpdateAdminUserMutation,
} from "../features/adminUsers/adminUsersApi";
import type {
  AdminUser,
  AdminUsersSortBy,
  CreateAdminEmployeeUserRequest,
  EmployeeRole,
  SortOrder,
  UpdateAdminUserRequest,
} from "../features/adminUsers/adminUsersTypes";
import {
  EMPLOYEE_ROLE_OPTIONS,
  extractApiErrorMessage,
  formatDateTime,
  getRoleLabel,
  getStatusLabel,
  isActiveStatus,
  validateDisplayName,
  validateEmailAddress,
  validatePassword,
  validatePasswordConfirmation,
} from "../features/adminUsers/adminUsersUtils";

type RoleFilter = EmployeeRole | "ALL";
type IsActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";
type PendingStatusAction = "activate" | "deactivate";

type CreateEmployeeFormState = {
  displayName: string;
  email: string;
  role: EmployeeRole;
  password: string;
  confirmPassword: string;
};

type EditEmployeeFormState = {
  displayName: string;
  role: EmployeeRole;
};

type CreateEmployeeField = keyof CreateEmployeeFormState;
type CreateEmployeeFormErrors = Partial<Record<CreateEmployeeField, string>>;

const SORT_OPTIONS: Array<{ value: AdminUsersSortBy; label: string }> = [
  { value: "createdAt", label: "Oluşturulma Tarihi" },
  { value: "updatedAt", label: "Güncellenme Tarihi" },
  { value: "displayName", label: "Ad Soyad" },
  { value: "email", label: "E-posta" },
  { value: "lastLoginAt", label: "Son Giriş" },
  { value: "role", label: "Rol" },
  { value: "status", label: "Durum" },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

const initialCreateEmployeeForm: CreateEmployeeFormState = {
  displayName: "",
  email: "",
  role: "PROJECT_MANAGER",
  password: "",
  confirmPassword: "",
};

export function Employees() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canManageUsers =
    currentUser?.accountType === "ADMIN" &&
    currentUser.role === "ADMIN" &&
    currentUser.permissions.includes("users.manage");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [isActiveFilter, setIsActiveFilter] = useState<IsActiveFilter>("ALL");
  const [sortBy, setSortBy] = useState<AdminUsersSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEmployeeFormState>(initialCreateEmployeeForm);
  const [createFieldErrors, setCreateFieldErrors] = useState<CreateEmployeeFormErrors>({});
  const [createSubmitError, setCreateSubmitError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditEmployeeFormState | null>(null);

  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const [statusActionTarget, setStatusActionTarget] = useState<{
    user: AdminUser;
    action: PendingStatusAction;
  } | null>(null);

  const query = useMemo(() => {
    const isActive =
      isActiveFilter === "ALL" ? undefined : isActiveFilter === "ACTIVE";

    return {
      page,
      limit,
      sortBy,
      sortOrder,
      accountType: "EMPLOYEE" as const,
      role: roleFilter === "ALL" ? undefined : roleFilter,
      isActive,
      search: search.trim().length > 0 ? search : undefined,
    };
  }, [isActiveFilter, limit, page, roleFilter, search, sortBy, sortOrder]);

  const {
    data: usersResponse,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminUsersQuery(query, { skip: !canManageUsers });

  const [createAdminUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [updateAdminUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
  const [deactivateAdminUser, { isLoading: isDeactivating }] = useDeactivateAdminUserMutation();
  const [activateAdminUser, { isLoading: isActivating }] = useActivateAdminUserMutation();
  const [resetAdminUserPassword, { isLoading: isResettingPassword }] =
    useResetAdminUserPasswordMutation();

  const users = usersResponse?.data ?? [];
  const meta = usersResponse?.meta ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const activeCount = users.filter((user) => isActiveStatus(user.status)).length;
  const inactiveCount = users.length - activeCount;

  const isMutating =
    isCreating || isUpdating || isDeactivating || isActivating || isResettingPassword;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    if (usersResponse && usersResponse.meta.totalPages > 0 && page > usersResponse.meta.totalPages) {
      setPage(usersResponse.meta.totalPages);
    }
  }, [page, usersResponse]);

  const handleRoleFilterChange = (value: RoleFilter) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: IsActiveFilter) => {
    setIsActiveFilter(value);
    setPage(1);
  };

  const handleSortByChange = (value: AdminUsersSortBy) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const validateCreateEmployeeField = (
    field: CreateEmployeeField,
    value: string,
    formState: CreateEmployeeFormState,
  ): string | null => {
    switch (field) {
      case "displayName":
        return validateDisplayName(value);
      case "email":
        return validateEmailAddress(value);
      case "role":
        return EMPLOYEE_ROLE_OPTIONS.includes(value as EmployeeRole)
          ? null
          : "Geçerli bir rol seçin.";
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validatePasswordConfirmation(formState.password, value);
      default:
        return null;
    }
  };

  const validateCreateEmployeeForm = (
    formState: CreateEmployeeFormState,
  ): CreateEmployeeFormErrors => {
    const nextErrors: CreateEmployeeFormErrors = {};

    const displayNameError = validateCreateEmployeeField(
      "displayName",
      formState.displayName,
      formState,
    );
    if (displayNameError) {
      nextErrors.displayName = displayNameError;
    }

    const emailError = validateCreateEmployeeField("email", formState.email, formState);
    if (emailError) {
      nextErrors.email = emailError;
    }

    const roleError = validateCreateEmployeeField("role", formState.role, formState);
    if (roleError) {
      nextErrors.role = roleError;
    }

    const passwordError = validateCreateEmployeeField("password", formState.password, formState);
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    const confirmPasswordError = validateCreateEmployeeField(
      "confirmPassword",
      formState.confirmPassword,
      formState,
    );
    if (confirmPasswordError) {
      nextErrors.confirmPassword = confirmPasswordError;
    }

    return nextErrors;
  };

  const openCreateModal = () => {
    setPageError(null);
    setPageSuccess(null);
    setCreateForm(initialCreateEmployeeForm);
    setCreateFieldErrors({});
    setCreateSubmitError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateForm(initialCreateEmployeeForm);
    setCreateFieldErrors({});
    setCreateSubmitError(null);
  };

  const updateCreateFormField = <TField extends CreateEmployeeField>(
    field: TField,
    value: CreateEmployeeFormState[TField],
  ) => {
    setCreateSubmitError(null);
    setCreateForm((prev) => {
      const nextForm: CreateEmployeeFormState = { ...prev, [field]: value };
      if (field === "password" && createFieldErrors.confirmPassword) {
        const confirmPasswordError = validatePasswordConfirmation(
          nextForm.password,
          nextForm.confirmPassword,
        );
        setCreateFieldErrors((prevErrors) => ({
          ...prevErrors,
          password: undefined,
          confirmPassword: confirmPasswordError ?? undefined,
        }));
      } else {
        setCreateFieldErrors((prevErrors) => ({
          ...prevErrors,
          [field]: undefined,
        }));
      }
      return nextForm;
    });
  };

  const handleCreateFieldBlur = (field: CreateEmployeeField) => {
    setCreateFieldErrors((prevErrors) => {
      const error = validateCreateEmployeeField(field, createForm[field], createForm);
      return {
        ...prevErrors,
        [field]: error ?? undefined,
      };
    });
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) {
      return;
    }

    setCreateSubmitError(null);
    setPageSuccess(null);

    const formErrors = validateCreateEmployeeForm(createForm);
    setCreateFieldErrors(formErrors);

    if (Object.values(formErrors).some((value) => typeof value === "string" && value.length > 0)) {
      setCreateSubmitError("Lütfen işaretli alanları kontrol edin.");
      return;
    }

    const payload: CreateAdminEmployeeUserRequest = {
      accountType: "EMPLOYEE",
      displayName: createForm.displayName.trim(),
      email: createForm.email.trim().toLowerCase(),
      role: createForm.role,
      password: createForm.password,
    };

    try {
      await createAdminUser(payload).unwrap();
      closeCreateModal();
      setPageSuccess("Çalışan başarıyla oluşturuldu.");
    } catch (error) {
      setCreateSubmitError(
        extractApiErrorMessage(error, "Çalışan oluşturulamadı. Lütfen tekrar deneyin."),
      );
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditTarget(user);
    setEditForm({
      displayName: user.displayName ?? "",
      role: toEmployeeRole(user.role),
    });
  };

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget || !editForm) {
      return;
    }

    setPageError(null);
    setPageSuccess(null);

    if (!editForm.displayName.trim()) {
      setPageError("Çalışan adı boş olamaz.");
      return;
    }

    const payload: UpdateAdminUserRequest = {
      displayName: editForm.displayName.trim(),
      role: editForm.role,
    };

    try {
      await updateAdminUser({ id: editTarget.id, body: payload }).unwrap();
      setEditTarget(null);
      setEditForm(null);
      setPageSuccess("Çalışan bilgileri güncellendi.");
    } catch (error) {
      setPageError(
        extractApiErrorMessage(error, "Çalışan bilgileri güncellenemedi. Lütfen tekrar deneyin."),
      );
    }
  };

  const handleStatusActionConfirm = async () => {
    if (!statusActionTarget) {
      return;
    }

    setPageError(null);
    setPageSuccess(null);

    const { user, action } = statusActionTarget;
    try {
      if (action === "deactivate") {
        await deactivateAdminUser(user.id).unwrap();
        setPageSuccess("Çalışan pasif duruma alındı.");
      } else {
        await activateAdminUser(user.id).unwrap();
        setPageSuccess("Çalışan tekrar aktif edildi.");
      }
      setStatusActionTarget(null);
    } catch (error) {
      setPageError(
        extractApiErrorMessage(
          error,
          action === "deactivate"
            ? "Pasife alma işlemi başarısız oldu."
            : "Aktifleştirme işlemi başarısız oldu.",
        ),
      );
    }
  };

  const handleResetPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetTarget) {
      return;
    }

    setPageError(null);
    setPageSuccess(null);

    const passwordMessage = validatePassword(resetPassword);
    if (passwordMessage) {
      setPageError(passwordMessage);
      return;
    }

    try {
      await resetAdminUserPassword({
        id: resetTarget.id,
        body: { newPassword: resetPassword },
      }).unwrap();
      setResetTarget(null);
      setResetPassword("");
      setPageSuccess("Şifre başarıyla sıfırlandı.");
    } catch (error) {
      setPageError(
        extractApiErrorMessage(error, "Şifre sıfırlama işlemi başarısız oldu."),
      );
    }
  };

  if (!canManageUsers) {
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
          <h1 className="text-2xl font-semibold text-white">Çalışan Yönetimi</h1>
          <p className="text-sm text-[#A0A0A0]">
            Backend Admin Users API üzerinden ekip yönetimi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/calisanlar/atamalar">
              <UserCog className="h-4 w-4" />
              Atamaları Yönet
            </Link>
          </Button>
          <Button
            type="button"
            className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" />
            Yeni Çalışan
          </Button>
        </div>
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
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <Users className="h-4 w-4 text-[#AAFF01]" />
            Toplam Kayıt
          </div>
          <div className="text-2xl font-semibold text-white">{meta.total}</div>
        </Card>
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <UserCheck className="h-4 w-4 text-[#AAFF01]" />
            Bu Sayfa Aktif
          </div>
          <div className="text-2xl font-semibold text-white">{activeCount}</div>
        </Card>
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <ShieldAlert className="h-4 w-4 text-orange-400" />
            Bu Sayfa Pasif
          </div>
          <div className="text-2xl font-semibold text-white">{inactiveCount}</div>
        </Card>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Label htmlFor="employee-search" className="mb-2 block text-xs text-[#A0A0A0]">
              Arama
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
              <Input
                id="employee-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="E-posta veya ad soyad ara..."
                className="border-white/[0.08] bg-[#202020] pl-10 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Rol</Label>
            <Select value={roleFilter} onValueChange={(value: RoleFilter) => handleRoleFilterChange(value)}>
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Roller</SelectItem>
                {EMPLOYEE_ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Durum</Label>
            <Select
              value={isActiveFilter}
              onValueChange={(value: IsActiveFilter) => handleStatusFilterChange(value)}
            >
              <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-[#A0A0A0]">Sıralama</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={sortBy}
                onValueChange={(value: AdminUsersSortBy) => handleSortByChange(value)}
              >
                <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: SortOrder) => handleSortOrderChange(value)}>
                <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Azalan</SelectItem>
                  <SelectItem value="asc">Artan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-[#202020]">
            <TableRow className="border-white/[0.06] hover:bg-[#202020]">
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Ad Soyad</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">E-posta</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Rol</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Durum</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Son Giriş</TableHead>
              <TableHead className="px-4 py-3 text-[#A0A0A0]">Oluşturulma</TableHead>
              <TableHead className="px-4 py-3 text-right text-[#A0A0A0]">Aksiyonlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="border-white/[0.06]">
                <TableCell colSpan={7} className="px-4 py-8 text-center text-[#A0A0A0]">
                  Çalışanlar yükleniyor...
                </TableCell>
              </TableRow>
            )}

            {isListError && !isLoading && (
              <TableRow className="border-white/[0.06]">
                <TableCell colSpan={7} className="px-4 py-8 text-center text-red-300">
                  {extractApiErrorMessage(
                    listError,
                    "Çalışan listesi alınamadı. Lütfen tekrar deneyin.",
                  )}
                  <div className="mt-3">
                    <Button variant="outline" onClick={() => refetch()}>
                      Tekrar Dene
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isListError && users.length === 0 && (
              <TableRow className="border-white/[0.06]">
                <TableCell colSpan={7} className="px-4 py-8 text-center text-[#A0A0A0]">
                  Filtrelere uygun çalışan bulunamadı.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isListError &&
              users.map((user) => {
                const isCurrentUser = currentUser?.id === user.id;
                const isActive = isActiveStatus(user.status);

                return (
                  <TableRow key={user.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                    <TableCell className="px-4 py-3 text-white">
                      {user.displayName?.trim() || "İsimsiz Kullanıcı"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">{user.email}</TableCell>
                    <TableCell className="px-4 py-3 text-white">{getRoleLabel(user.role)}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        className={
                          isActive
                            ? "bg-[#AAFF01] text-[#131313]"
                            : "border-white/[0.12] bg-white/[0.08] text-[#E5E5E5]"
                        }
                      >
                        {getStatusLabel(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">
                      {formatDateTime(user.lastLoginAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#A0A0A0]">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/calisanlar/${user.id}`}>
                          <Button size="sm" variant="outline">
                            Detay
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(user)}
                          disabled={isMutating || user.accountType !== "EMPLOYEE"}
                        >
                          Düzenle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPageError(null);
                            setPageSuccess(null);
                            setResetTarget(user);
                            setResetPassword("");
                          }}
                          disabled={isMutating || user.accountType !== "EMPLOYEE"}
                        >
                          Şifre Sıfırla
                        </Button>
                        <Button
                          size="sm"
                          variant={isActive ? "destructive" : "outline"}
                          onClick={() => setStatusActionTarget({ user, action: isActive ? "deactivate" : "activate" })}
                          disabled={isMutating || isCurrentUser || user.accountType !== "EMPLOYEE"}
                        >
                          {isActive ? "Pasife Al" : "Aktifleştir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#A0A0A0]">
            Sayfa {meta.page} / {Math.max(meta.totalPages, 1)} · Toplam {meta.total} kayıt
            {isFetching && <span className="ml-2 text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(limit)} onValueChange={(value) => handleLimitChange(Number(value))}>
              <SelectTrigger className="h-9 w-[110px] border-white/[0.08] bg-[#202020]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} / sayfa
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!meta.hasPreviousPage || isFetching}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!meta.hasNextPage || isFetching}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? openCreateModal() : closeCreateModal())}>
        <DialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Yeni Çalışan Oluştur</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Çalışan hesabı backend API üzerinden oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} noValidate className="space-y-4">
            {createSubmitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {createSubmitError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="create-display-name">Ad Soyad</Label>
              <Input
                id="create-display-name"
                value={createForm.displayName}
                onChange={(event) => updateCreateFormField("displayName", event.target.value)}
                onBlur={() => handleCreateFieldBlur("displayName")}
                className="border-white/[0.08] bg-[#202020]"
                placeholder="Yeni Çalışan"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                aria-invalid={Boolean(createFieldErrors.displayName)}
                aria-describedby={
                  createFieldErrors.displayName ? "create-display-name-error" : undefined
                }
              />
              {createFieldErrors.displayName && (
                <p id="create-display-name-error" className="text-xs text-red-300">
                  {createFieldErrors.displayName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">E-posta</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(event) => updateCreateFormField("email", event.target.value)}
                onBlur={() => handleCreateFieldBlur("email")}
                className="border-white/[0.08] bg-[#202020]"
                placeholder="developer2@socialtech.com"
                required
                maxLength={254}
                autoComplete="email"
                aria-invalid={Boolean(createFieldErrors.email)}
                aria-describedby={createFieldErrors.email ? "create-email-error" : undefined}
              />
              {createFieldErrors.email && (
                <p id="create-email-error" className="text-xs text-red-300">
                  {createFieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={createForm.role}
                onValueChange={(value: EmployeeRole) => updateCreateFormField("role", value)}
              >
                <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createFieldErrors.role && (
                <p className="text-xs text-red-300">{createFieldErrors.role}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Geçici Şifre</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(event) => updateCreateFormField("password", event.target.value)}
                onBlur={() => handleCreateFieldBlur("password")}
                className="border-white/[0.08] bg-[#202020]"
                placeholder="TempPass123"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                aria-invalid={Boolean(createFieldErrors.password)}
                aria-describedby={createFieldErrors.password ? "create-password-error" : undefined}
              />
              {createFieldErrors.password && (
                <p id="create-password-error" className="text-xs text-red-300">
                  {createFieldErrors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-confirm-password">Şifre Tekrarı</Label>
              <Input
                id="create-confirm-password"
                type="password"
                value={createForm.confirmPassword}
                onChange={(event) =>
                  updateCreateFormField("confirmPassword", event.target.value)
                }
                onBlur={() => handleCreateFieldBlur("confirmPassword")}
                className="border-white/[0.08] bg-[#202020]"
                placeholder="TempPass123"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                aria-invalid={Boolean(createFieldErrors.confirmPassword)}
                aria-describedby={
                  createFieldErrors.confirmPassword
                    ? "create-confirm-password-error"
                    : undefined
                }
              />
              {createFieldErrors.confirmPassword && (
                <p id="create-confirm-password-error" className="text-xs text-red-300">
                  {createFieldErrors.confirmPassword}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateModal} disabled={isCreating}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isCreating}
              >
                {isCreating ? "Oluşturuluyor..." : "Çalışan Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editTarget && editForm)}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
            setEditForm(null);
          }
        }}
      >
        <DialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Çalışan Bilgisi Güncelle</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              E-posta ve hesap tipi bu ekrandan değiştirilemez.
            </DialogDescription>
          </DialogHeader>
          {editTarget && editForm && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {pageError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {pageError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-display-name">Ad Soyad</Label>
                <Input
                  id="edit-display-name"
                  value={editForm.displayName}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            displayName: event.target.value,
                          }
                        : prev,
                    )
                  }
                  className="border-white/[0.08] bg-[#202020]"
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: EmployeeRole) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            role: value,
                          }
                        : prev,
                    )
                  }
                >
                  <SelectTrigger className="border-white/[0.08] bg-[#202020]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditTarget(null);
                    setEditForm(null);
                  }}
                  disabled={isUpdating}
                >
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(resetTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setResetTarget(null);
            setResetPassword("");
          }
        }}
      >
        <DialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Şifre Sıfırla</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              {resetTarget
                ? `${resetTarget.displayName ?? resetTarget.email} için yeni geçici şifre belirleyin.`
                : "Yeni geçici şifre belirleyin."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {pageError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {pageError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reset-password">Yeni Şifre</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                className="border-white/[0.08] bg-[#202020]"
                placeholder="TempPass123"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResetTarget(null);
                  setResetPassword("");
                }}
                disabled={isResettingPassword}
              >
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isResettingPassword}
              >
                {isResettingPassword ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(statusActionTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setStatusActionTarget(null);
          }
        }}
      >
        <AlertDialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusActionTarget?.action === "deactivate"
                ? "Çalışanı Pasife Al"
                : "Çalışanı Aktifleştir"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#A0A0A0]">
              {statusActionTarget?.action === "deactivate"
                ? "Bu kullanıcı panel erişimini kaybeder ve aktif oturumları kapatılır."
                : "Bu kullanıcı yeniden giriş yaparak panele erişebilir."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating || isActivating}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className={
                statusActionTarget?.action === "deactivate"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
              }
              onClick={handleStatusActionConfirm}
              disabled={isDeactivating || isActivating}
            >
              {statusActionTarget?.action === "deactivate"
                ? isDeactivating
                  ? "Pasife Alınıyor..."
                  : "Pasife Al"
                : isActivating
                  ? "Aktifleştiriliyor..."
                  : "Aktifleştir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function toEmployeeRole(role: UserRole): EmployeeRole {
  if (role === "ADMIN") {
    return "PROJECT_MANAGER";
  }

  return role;
}
