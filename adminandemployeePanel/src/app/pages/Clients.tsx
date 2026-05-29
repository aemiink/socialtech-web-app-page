import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  FolderOpen,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Textarea } from "../components/ui/textarea";
import {
  hasAdminPermission,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import { useGetAdminUsersQuery } from "../features/adminUsers/adminUsersApi";
import type {
  AdminUser,
  AdminUsersListQuery,
} from "../features/adminUsers/adminUsersTypes";
import { getRoleLabel, isActiveStatus } from "../features/adminUsers/adminUsersUtils";
import {
  useCreateAdminAssignmentMutation,
} from "../features/adminAssignments/adminAssignmentsApi";
import type {
  AdminAssignmentScope,
  CreateAdminAssignmentRequest,
} from "../features/adminAssignments/adminAssignmentsTypes";
import {
  ADMIN_ASSIGNMENT_SCOPE_OPTIONS,
  getAssignmentScopeLabel,
} from "../features/adminAssignments/adminAssignmentsUtils";
import {
  useActivateAdminClientMutation,
  useCreateAdminClientMutation,
  useCreateOrLinkClientOwnerMutation,
  useDeactivateAdminClientMutation,
  useGetClientsQuery,
  useGetAdminClientSocialMediaConfigQuery,
  useUpdateAdminClientAmazonAdsConfigMutation,
  useUpdateAdminClientSocialMediaConfigMutation,
  useUpdateAdminClientMutation,
} from "../features/clients/clientsApi";
import type {
  AmazonAdsRegion,
  AdminClientSocialMediaConfig,
  ClientProfile,
  ClientStatus,
  ClientsListQuery,
  ClientsSortBy,
  ClientsSortOrder,
  CreateAdminClientRequest,
  CreateOrLinkClientOwnerRequest,
  ServiceKey,
  SocialMediaGoal,
  UpdateAdminClientAmazonAdsConfigRequest,
  UpdateAdminClientSocialMediaConfigRequest,
  UpdateAdminClientRequest,
} from "../features/clients/clientsTypes";
import {
  CLIENT_STATUS_OPTIONS,
  SERVICE_CATALOG,
  extractApiErrorMessage,
  formatClientDate,
  formatClientDateTime,
  getActivePurchasedServiceKeys,
  getActivePurchasedServices,
  getClientStatusBadgeClass,
  getClientStatusLabel,
  getPurchasedServicesSummary,
  getServiceLabel,
  shortId,
  validateClientName,
  validateClientOwnerDisplayName,
  validateClientOwnerEmail,
  validateClientOwnerPassword,
  validateClientSlug,
} from "../features/clients/clientsUtils";
import { useAppSelector } from "../store/hooks";

const CLIENT_SORT_OPTIONS: Array<{ value: ClientsSortBy; label: string }> = [
  { value: "name", label: "Firma" },
  { value: "slug", label: "Portal Slug" },
  { value: "status", label: "Durum" },
  { value: "createdAt", label: "Oluşturulma" },
  { value: "updatedAt", label: "Güncellenme" },
];

const SEARCH_DEBOUNCE_MS = 275;
const OWNER_PICKER_LIMIT = 8;
const EMPLOYEE_PICKER_LIMIT = 8;
const EXISTING_OWNER_REQUIRED_MESSAGE = "Bağlanacak mevcut portal sahibini seçin.";

type ClientStatusFilter = ClientStatus | "ALL";
type ClientOwnerMode = "NONE" | "CREATE" | "LINK_EXISTING";
type PendingClientStatusAction = "activate" | "deactivate";
type AmazonAdsPaymentMethodState = "" | "true" | "false";
type SocialMediaGoalState = "" | SocialMediaGoal;
type AssignmentFormState = {
  employee: AdminUser | null;
  scope: AdminAssignmentScope;
};

type ClientFormState = {
  name: string;
  slug: string;
  status: ClientStatus;
  ownerMode: ClientOwnerMode;
  ownerEmail: string;
  ownerDisplayName: string;
  ownerPassword: string;
  existingOwnerUserId: string;
  purchasedServices: ServiceKey[];
  amazonProfileId: string;
  amazonAdvertiserAccountId: string;
  amazonMarketplaceId: string;
  amazonRegion: "" | AmazonAdsRegion;
  amazonCountryCode: string;
  amazonCurrencyCode: string;
  amazonTimezone: string;
  amazonAccountType: string;
  amazonAccountName: string;
  amazonValidPaymentMethod: AmazonAdsPaymentMethodState;
  socialInstagramUsername: string;
  socialInstagramAccountId: string;
  socialFacebookPageId: string;
  socialTiktokUsername: string;
  socialLinkedinPageUrl: string;
  socialContentFrequency: string;
  socialPrimaryGoal: SocialMediaGoalState;
  socialToneOfVoice: string;
  socialHashtags: string;
  socialNotes: string;
};

type ClientFormField = keyof ClientFormState;
type ClientFormValue = ClientFormState[ClientFormField];

const initialClientForm: ClientFormState = {
  name: "",
  slug: "",
  status: "ACTIVE",
  ownerMode: "NONE",
  ownerEmail: "",
  ownerDisplayName: "",
  ownerPassword: "",
  existingOwnerUserId: "",
  purchasedServices: [],
  amazonProfileId: "",
  amazonAdvertiserAccountId: "",
  amazonMarketplaceId: "",
  amazonRegion: "",
  amazonCountryCode: "",
  amazonCurrencyCode: "",
  amazonTimezone: "",
  amazonAccountType: "",
  amazonAccountName: "",
  amazonValidPaymentMethod: "",
  socialInstagramUsername: "",
  socialInstagramAccountId: "",
  socialFacebookPageId: "",
  socialTiktokUsername: "",
  socialLinkedinPageUrl: "",
  socialContentFrequency: "",
  socialPrimaryGoal: "",
  socialToneOfVoice: "",
  socialHashtags: "",
  socialNotes: "",
};

const initialAssignmentForm: AssignmentFormState = {
  employee: null,
  scope: "PROJECT",
};

const SOCIAL_MEDIA_GOAL_OPTIONS: Array<{ value: SocialMediaGoal; label: string }> = [
  { value: "BRAND_AWARENESS", label: "Brand Awareness" },
  { value: "COMMUNITY_GROWTH", label: "Community Growth" },
  { value: "ENGAGEMENT", label: "Engagement" },
  { value: "LEAD_GENERATION", label: "Lead Generation" },
  { value: "SALES_SUPPORT", label: "Sales Support" },
  { value: "REPUTATION", label: "Reputation" },
  { value: "MIXED", label: "Mixed" },
];

export function Clients() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canManageClients = hasAdminPermission(currentUser, ["clients.manage"]);
  const canManageAssignments = hasAdminPermission(currentUser, ["assignments.manage"]);
  const canReadAdminUsers = hasAdminPermission(currentUser, ["users.manage"]);

  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<ClientsSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<ClientsSortOrder>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClientFormState>(initialClientForm);
  const [createSelectedExistingOwner, setCreateSelectedExistingOwner] =
    useState<AdminUser | null>(null);
  const [createSubmitError, setCreateSubmitError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<ClientProfile | null>(null);
  const [editForm, setEditForm] = useState<ClientFormState | null>(null);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  const [statusActionTarget, setStatusActionTarget] = useState<{
    client: ClientProfile;
    action: PendingClientStatusAction;
  } | null>(null);
  const [statusSubmitError, setStatusSubmitError] = useState<string | null>(null);

  const [assignmentTargetClient, setAssignmentTargetClient] = useState<ClientProfile | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(initialAssignmentForm);
  const [assignmentSubmitError, setAssignmentSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      setSearch((previousSearch) => {
        if (previousSearch === nextSearch) {
          return previousSearch;
        }

        setPage(1);
        return nextSearch;
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const clientsQuery = useMemo<ClientsListQuery>(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
      search: search.trim() || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    }),
    [limit, page, search, sortBy, sortOrder, statusFilter],
  );

  const {
    data: clientsResponse,
    currentData: currentClientsResponse,
    error: listError,
    isError: isListError,
    isFetching,
    isLoading,
    refetch,
  } = useGetClientsQuery(clientsQuery);

  const [createAdminClient, { isLoading: isCreating }] = useCreateAdminClientMutation();
  const [updateAdminClient, { isLoading: isUpdating }] = useUpdateAdminClientMutation();
  const [updateAdminClientAmazonAdsConfig, { isLoading: isUpdatingAmazonAdsConfig }] =
    useUpdateAdminClientAmazonAdsConfigMutation();
  const [updateAdminClientSocialMediaConfig, { isLoading: isUpdatingSocialMediaConfig }] =
    useUpdateAdminClientSocialMediaConfigMutation();
  const [deactivateAdminClient, { isLoading: isDeactivating }] =
    useDeactivateAdminClientMutation();
  const [activateAdminClient, { isLoading: isActivating }] = useActivateAdminClientMutation();
  const [createOrLinkClientOwner, { isLoading: isLinkingOwner }] =
    useCreateOrLinkClientOwnerMutation();
  const [createAdminAssignment, { isLoading: isCreatingAssignment }] =
    useCreateAdminAssignmentMutation();
  const shouldLoadEditSocialMediaConfig = Boolean(
    editTarget && editForm && isSocialMediaSelected(editForm.purchasedServices),
  );
  const {
    data: editSocialMediaConfig,
    isFetching: isFetchingEditSocialMediaConfig,
  } = useGetAdminClientSocialMediaConfigQuery(editTarget?.id ?? "", {
    skip: !shouldLoadEditSocialMediaConfig,
  });

  const clients = clientsResponse?.data ?? [];
  const responsePage = currentClientsResponse?.meta.page;
  const meta = clientsResponse?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: page > 1,
  };

  useEffect(() => {
    if (responsePage !== undefined && responsePage !== page) {
      setPage(responsePage);
    }
  }, [page, responsePage]);

  const hasActiveFilters = searchInput.trim().length > 0 || statusFilter !== "ALL";
  const activeOnPageCount = clients.filter((client) => client.status === "ACTIVE").length;
  const recentActivityCount = clients.filter(
    (client) => isDateInCurrentMonth(client.createdAt) || isWithinLastDays(client.updatedAt, 30),
  ).length;
  const isMutating =
    isCreating ||
    isUpdating ||
    isDeactivating ||
    isActivating ||
    isLinkingOwner ||
    isUpdatingAmazonAdsConfig ||
    isUpdatingSocialMediaConfig ||
    isCreatingAssignment;

  const kpiCards = [
    {
      label: "Toplam Müşteri",
      value: getMetricValue(meta.total, isLoading, isListError),
      icon: Users,
      color: "text-white",
    },
    {
      label: "Sayfadaki Kayıt",
      value: getMetricValue(clients.length, isLoading, isListError),
      icon: Building2,
      color: "text-[#AAFF01]",
    },
    {
      label: "Aktif (Sayfa)",
      value: getMetricValue(activeOnPageCount, isLoading, isListError),
      icon: UserPlus,
      color: "text-blue-400",
    },
    {
      label: "Son 30 Gün (Sayfa)",
      value: getMetricValue(recentActivityCount, isLoading, isListError),
      icon: Calendar,
      color: "text-orange-400",
    },
  ];

  function resetToFirstPage() {
    setPage(1);
  }

  function openCreateDialog() {
    setPageError(null);
    setPageSuccess(null);
    setCreateSubmitError(null);
    setCreateForm(initialClientForm);
    setCreateSelectedExistingOwner(null);
    setIsCreateOpen(true);
  }

  function closeCreateDialog() {
    setIsCreateOpen(false);
    setCreateSubmitError(null);
    setCreateForm(initialClientForm);
    setCreateSelectedExistingOwner(null);
  }

  function updateCreateForm(field: ClientFormField, value: ClientFormValue) {
    setCreateSubmitError(null);
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  function selectCreateExistingOwner(owner: AdminUser) {
    setCreateSubmitError(null);
    setCreateSelectedExistingOwner(owner);
    setCreateForm((prev) => ({ ...prev, existingOwnerUserId: owner.id }));
  }

  function clearCreateExistingOwner() {
    setCreateSubmitError(null);
    setCreateSelectedExistingOwner(null);
    setCreateForm((prev) => ({ ...prev, existingOwnerUserId: "" }));
  }

  function openEditDialog(client: ClientProfile) {
    setPageError(null);
    setPageSuccess(null);
    setEditSubmitError(null);
    setEditTarget(client);
    setEditForm(clientToForm(client));
  }

  function closeEditDialog() {
    setEditTarget(null);
    setEditForm(null);
    setEditSubmitError(null);
  }

  function updateEditForm(field: ClientFormField, value: ClientFormValue) {
    setEditSubmitError(null);
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  useEffect(() => {
    if (!editTarget || !editSocialMediaConfig) {
      return;
    }

    setEditForm((prev) => {
      if (!prev || editTarget.id !== editSocialMediaConfig.clientProfileId) {
        return prev;
      }

      return {
        ...prev,
        ...socialMediaConfigToFormFields(editSocialMediaConfig),
      };
    });
  }, [editTarget, editSocialMediaConfig]);

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreating || isLinkingOwner || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig) {
      return;
    }

    setCreateSubmitError(null);
    setPageError(null);
    setPageSuccess(null);

    const validationMessage = validateClientForm(createForm, true, canReadAdminUsers);
    if (validationMessage) {
      setCreateSubmitError(validationMessage);
      return;
    }

    try {
      const createdClient = await createAdminClient(buildCreateClientPayload(createForm)).unwrap();
      const ownerPayload = buildOwnerPayload(createForm);
      const amazonAdsPayload = buildAmazonAdsConfigPayload(createForm);
      const socialMediaPayload = buildSocialMediaConfigPayload(createForm);

      if (ownerPayload) {
        try {
          await createOrLinkClientOwner({
            clientId: createdClient.id,
            body: ownerPayload,
          }).unwrap();
        } catch (error) {
          closeCreateDialog();
          setPageError(
            `Müşteri oluşturuldu ancak portal sahibi bağlanamadı: ${extractApiErrorMessage(
              error,
              "Sahip bağlantısı tamamlanamadı.",
            )}`,
          );
          return;
        }
      }

      if (amazonAdsPayload) {
        try {
          await updateAdminClientAmazonAdsConfig({
            clientId: createdClient.id,
            body: amazonAdsPayload,
          }).unwrap();
        } catch (error) {
          closeCreateDialog();
          setPageError(
            `Müşteri oluşturuldu ancak Amazon Ads yapılandırması kaydedilemedi: ${extractApiErrorMessage(
              error,
              "Amazon Ads yapılandırması tamamlanamadı.",
            )}`,
          );
          return;
        }
      }

      if (socialMediaPayload) {
        try {
          await updateAdminClientSocialMediaConfig({
            clientId: createdClient.id,
            body: socialMediaPayload,
          }).unwrap();
        } catch (error) {
          closeCreateDialog();
          setPageError(
            `Müşteri oluşturuldu ancak Social Media yapılandırması kaydedilemedi: ${extractApiErrorMessage(
              error,
              "Social Media yapılandırması tamamlanamadı.",
            )}`,
          );
          return;
        }
      }

      closeCreateDialog();
      setPageSuccess(
        ownerPayload || amazonAdsPayload || socialMediaPayload
          ? "Müşteri bağlantı bilgileriyle birlikte başarıyla kaydedildi."
          : "Müşteri başarıyla oluşturuldu.",
      );
    } catch (error) {
      setCreateSubmitError(
        extractApiErrorMessage(error, "Müşteri oluşturulamadı. Lütfen tekrar deneyin."),
      );
    }
  }

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !editTarget ||
      !editForm ||
      isUpdating ||
      isUpdatingAmazonAdsConfig ||
      isUpdatingSocialMediaConfig ||
      isFetchingEditSocialMediaConfig
    ) {
      return;
    }

    setEditSubmitError(null);
    setPageError(null);
    setPageSuccess(null);

    const validationMessage = validateClientForm(editForm, false, canReadAdminUsers);
    if (validationMessage) {
      setEditSubmitError(validationMessage);
      return;
    }

    try {
      const updatedClient = await updateAdminClient({
        id: editTarget.id,
        body: buildUpdateClientPayload(editForm),
      }).unwrap();
      setSelectedClient((prev) => (prev?.id === updatedClient.id ? updatedClient : prev));
      const amazonAdsPayload = buildAmazonAdsConfigPayload(editForm);
      if (amazonAdsPayload) {
        try {
          await updateAdminClientAmazonAdsConfig({
            clientId: editTarget.id,
            body: amazonAdsPayload,
          }).unwrap();
        } catch (error) {
          setEditSubmitError(
            `Müşteri güncellendi ancak Amazon Ads yapılandırması kaydedilemedi: ${extractApiErrorMessage(
              error,
              "Amazon Ads yapılandırması tamamlanamadı.",
            )}`,
          );
          return;
        }
      }
      const socialMediaPayload = buildSocialMediaConfigPayload(editForm);
      if (socialMediaPayload) {
        try {
          await updateAdminClientSocialMediaConfig({
            clientId: editTarget.id,
            body: socialMediaPayload,
          }).unwrap();
        } catch (error) {
          setEditSubmitError(
            `Müşteri güncellendi ancak Social Media yapılandırması kaydedilemedi: ${extractApiErrorMessage(
              error,
              "Social Media yapılandırması tamamlanamadı.",
            )}`,
          );
          return;
        }
      }
      closeEditDialog();
      setPageSuccess("Müşteri bilgileri güncellendi.");
    } catch (error) {
      setEditSubmitError(
        extractApiErrorMessage(error, "Müşteri güncellenemedi. Lütfen tekrar deneyin."),
      );
    }
  }

  function openStatusDialog(client: ClientProfile) {
    setPageError(null);
    setPageSuccess(null);
    setStatusSubmitError(null);
    setStatusActionTarget({
      client,
      action: client.status === "ACTIVE" ? "deactivate" : "activate",
    });
  }

  function closeStatusDialog() {
    setStatusActionTarget(null);
    setStatusSubmitError(null);
  }

  function openAssignmentDialog(client: ClientProfile) {
    setPageError(null);
    setPageSuccess(null);
    setAssignmentSubmitError(null);
    setAssignmentTargetClient(client);
    setAssignmentForm(initialAssignmentForm);
  }

  function closeAssignmentDialog() {
    setAssignmentTargetClient(null);
    setAssignmentSubmitError(null);
    setAssignmentForm(initialAssignmentForm);
  }

  async function handleCreateAssignmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assignmentTargetClient || isCreatingAssignment) {
      return;
    }

    setAssignmentSubmitError(null);
    setPageError(null);
    setPageSuccess(null);

    if (!canReadAdminUsers) {
      setAssignmentSubmitError("Çalışan listesini görmek için `users.manage` yetkisi gerekir.");
      return;
    }

    if (!assignmentForm.employee) {
      setAssignmentSubmitError("Atanacak çalışanı seçin.");
      return;
    }

    const payload: CreateAdminAssignmentRequest = {
      employeeUserId: assignmentForm.employee.id,
      clientProfileId: assignmentTargetClient.id,
      scope: assignmentForm.scope,
    };

    try {
      await createAdminAssignment(payload).unwrap();
      closeAssignmentDialog();
      setPageSuccess("Çalışan ataması başarıyla oluşturuldu.");
    } catch (error) {
      setAssignmentSubmitError(
        extractApiErrorMessage(error, "Çalışan ataması oluşturulamadı. Lütfen tekrar deneyin."),
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

    const { client, action } = statusActionTarget;

    try {
      const updatedClient = action === "deactivate"
        ? await deactivateAdminClient(client.id).unwrap()
        : await activateAdminClient(client.id).unwrap();

      setSelectedClient((prev) => (prev?.id === updatedClient.id ? updatedClient : prev));
      closeStatusDialog();
      setPageSuccess(
        action === "deactivate"
          ? "Müşteri pasif duruma alındı."
          : "Müşteri tekrar aktif edildi.",
      );
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Müşteriler</h1>
          <p className="text-sm text-[#A0A0A0]">
            Backend Clients API üzerinden sayfalı müşteri profilleri
          </p>
        </div>
        <Button
          type="button"
          className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          onClick={openCreateDialog}
          disabled={!canManageClients || isMutating}
          title={canManageClients ? undefined : "Bu işlem için müşteri yönetim yetkisi gerekir."}
        >
          <UserPlus className="h-4 w-4" />
          Yeni Müşteri Ekle
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className={`rounded-lg bg-white/5 p-2 ${kpi.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {isFetching && !isLoading && (
                  <span className="text-xs text-[#d2ff8a]">Güncelleniyor</span>
                )}
              </div>
              <div className="mb-1 text-2xl font-semibold text-white">{kpi.value}</div>
              <div className="text-sm text-[#A0A0A0]">{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_170px_140px_120px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
            <Input
              id="client-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Firma veya slug ara..."
              className="border-white/[0.06] bg-[#202020] pl-10 text-white"
            />
          </div>

          <SelectControl
            ariaLabel="Durum filtresi"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as ClientStatusFilter);
              resetToFirstPage();
            }}
          >
            <option value="ALL">Tüm Durumlar</option>
            {CLIENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {getClientStatusLabel(status)}
              </option>
            ))}
          </SelectControl>

          <SelectControl
            ariaLabel="Sıralama alanı"
            value={sortBy}
            onChange={(value) => {
              setSortBy(value as ClientsSortBy);
              resetToFirstPage();
            }}
          >
            {CLIENT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectControl>

          <SelectControl
            ariaLabel="Sıralama yönü"
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value as ClientsSortOrder);
              resetToFirstPage();
            }}
          >
            <option value="asc">Artan</option>
            <option value="desc">Azalan</option>
          </SelectControl>

          <SelectControl
            ariaLabel="Sayfa boyutu"
            value={String(limit)}
            onChange={(value) => {
              setLimit(Number(value));
              resetToFirstPage();
            }}
          >
            <option value="10">10 / sayfa</option>
            <option value="20">20 / sayfa</option>
            <option value="50">50 / sayfa</option>
          </SelectControl>

          <div className="flex flex-wrap gap-2">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setStatusFilter("ALL");
                  resetToFirstPage();
                }}
                className="gap-1"
              >
                <X className="h-3 w-3" />
                Temizle
              </Button>
            )}

            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>
      </Card>

      {isLoading && (
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  {["Firma", "Portal Slug", "Hizmetler", "Durum", "Oluşturulma", "Güncellenme", "Kayıt ID", "Aksiyonlar"].map((col) => (
                    <th key={col} className="p-4 text-left text-sm font-medium text-[#A0A0A0]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-t border-white/[0.06]">
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="p-4">
                        <div className="h-4 rounded bg-white/[0.06] animate-pulse" style={{ width: cellIndex === 7 ? "120px" : "80%" }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isListError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(listError, "Müşteri listesi alınamadı. Lütfen tekrar deneyin.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {!isLoading && !isListError && clients.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-white/[0.04] p-4">
              <FolderOpen className="h-8 w-8 text-[#A0A0A0]" />
            </div>
            <p className="text-[#A0A0A0]">
              {hasActiveFilters ? "Filtrelere uygun müşteri bulunamadı." : "Henüz müşteri kaydı bulunmuyor."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setStatusFilter("ALL");
                  setPage(1);
                }}
                className="text-sm text-[#AAFF01] hover:underline"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        </Card>
      )}

      {!isLoading && !isListError && clients.length > 0 && (
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Firma</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Portal Slug</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Hizmetler</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Durum</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Oluşturulma</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Güncellenme</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Kayıt ID</th>
                  <th className="p-4 text-right text-sm font-medium text-[#A0A0A0]">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const nextStatusAction =
                    client.status === "ACTIVE" ? "deactivate" : "activate";

                  return (
                    <tr
                      key={client.id}
                      className="border-t border-white/[0.06] transition-colors hover:bg-white/[0.04] even:bg-white/[0.02]"
                    >
                      <td className="p-4">
                        <div className="font-medium text-white">{client.companyName}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {client.slug}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <ServiceBadgeSummary client={client} />
                      </td>
                      <td className="p-4 text-sm text-[#D8D8D8]">
                        <Badge className={getClientStatusBadgeClass(client.status)}>
                          {getClientStatusLabel(client.status)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[#A0A0A0]">{formatClientDate(client.createdAt)}</td>
                      <td className="p-4 text-sm text-[#A0A0A0]">{formatClientDateTime(client.updatedAt)}</td>
                      <td className="p-4 font-mono text-sm text-[#A0A0A0]">{shortId(client.id)}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => setSelectedClient(client)}
                          >
                            <Eye className="h-4 w-4" />
                            Önizle
                          </Button>
                          <Link to={`/musteriler/${client.id}`}>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                            >
                              Detay
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openEditDialog(client)}
                            disabled={!canManageClients || isMutating}
                            title={canManageClients ? undefined : "Bu işlem için müşteri yönetim yetkisi gerekir."}
                          >
                            <Edit className="h-4 w-4" />
                            Düzenle
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openAssignmentDialog(client)}
                            disabled={!canManageAssignments || isMutating}
                            title={
                              canManageAssignments
                                ? undefined
                                : "Bu işlem için assignments.manage yetkisi gerekir."
                            }
                          >
                            <UserCog className="h-4 w-4" />
                            Çalışan Ata
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={nextStatusAction === "deactivate" ? "destructive" : "outline"}
                            className="gap-2"
                            onClick={() => openStatusDialog(client)}
                            disabled={!canManageClients || isMutating}
                            title={canManageClients ? undefined : "Bu işlem için müşteri yönetim yetkisi gerekir."}
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

          <PaginationFooter
            meta={meta}
            isFetching={isFetching}
            onPrevious={() => setPage(Math.max(meta.page - 1, 1))}
            onNext={() => setPage(Math.min(meta.page + 1, meta.totalPages))}
          />
        </Card>
      )}

      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="w-[500px] border-l border-white/[0.06] bg-[#1A1A1A]">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl text-white">{selectedClient.companyName}</SheetTitle>
                <SheetDescription className="sr-only">
                  Seçili müşterinin durum, kayıt ve satın alınan hizmet detayları.
                </SheetDescription>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className={getClientStatusBadgeClass(selectedClient.status)}>
                    {getClientStatusLabel(selectedClient.status)}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {selectedClient.slug}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-white/[0.06] bg-[#202020] p-4">
                    <p className="mb-1 text-xs text-[#A0A0A0]">Oluşturulma</p>
                    <p className="text-sm font-semibold text-white">
                      {formatClientDate(selectedClient.createdAt)}
                    </p>
                  </Card>
                  <Card className="border-white/[0.06] bg-[#202020] p-4">
                    <p className="mb-1 text-xs text-[#A0A0A0]">Son Güncelleme</p>
                    <p className="text-sm font-semibold text-white">
                      {formatClientDateTime(selectedClient.updatedAt)}
                    </p>
                  </Card>
                </div>

                <Card className="border-white/[0.06] bg-[#202020] p-4">
                  <p className="mb-2 text-xs text-[#A0A0A0]">Müşteri Kayıt ID</p>
                  <p className="break-all font-mono text-sm text-white">{selectedClient.id}</p>
                </Card>

                <Card className="border-white/[0.06] bg-[#202020] p-4">
                  <p className="mb-3 text-xs text-[#A0A0A0]">Satın Alınan Hizmetler</p>
                  <ServiceBadgeSummary client={selectedClient} expanded />
                </Card>

                <div className="border-t border-white/[0.06] pt-4">
                  <Link to={`/musteriler/${selectedClient.id}`}>
                    <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                      Müşteri Detayına Git
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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
            <DialogTitle>Yeni Müşteri Oluştur</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Müşteri kaydı Admin Clients API üzerinden oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
            {createSubmitError && createSubmitError !== EXISTING_OWNER_REQUIRED_MESSAGE && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {createSubmitError}
              </div>
            )}
            <ClientFormFields
              idPrefix="create-client"
              form={createForm}
              onChange={updateCreateForm}
              disabled={isCreating || isLinkingOwner || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig}
              includeOwnerFields
              canLinkExistingOwner={canReadAdminUsers}
              selectedExistingOwner={createSelectedExistingOwner}
              existingOwnerError={
                createSubmitError === EXISTING_OWNER_REQUIRED_MESSAGE ? createSubmitError : null
              }
              onExistingOwnerSelect={selectCreateExistingOwner}
              onExistingOwnerClear={clearCreateExistingOwner}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateDialog}
                disabled={isCreating || isLinkingOwner || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig}
              >
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isCreating || isLinkingOwner || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig}
              >
                {isCreating || isLinkingOwner || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig
                  ? "Kaydediliyor..."
                  : "Müşteri Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editTarget && editForm)}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Müşteri Güncelle</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Müşteri profil bilgileri Admin Clients API üzerinden güncellenecektir.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4" noValidate>
              {editSubmitError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {editSubmitError}
                </div>
              )}
              <ClientFormFields
                idPrefix="edit-client"
                form={editForm}
                onChange={updateEditForm}
                disabled={isUpdating || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig || isFetchingEditSocialMediaConfig}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditDialog}
                  disabled={isUpdating || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig || isFetchingEditSocialMediaConfig}
                >
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                  disabled={isUpdating || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig || isFetchingEditSocialMediaConfig}
                >
                  {isUpdating || isUpdatingAmazonAdsConfig || isUpdatingSocialMediaConfig
                    ? "Kaydediliyor..."
                    : "Değişiklikleri Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          )}
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
                ? "Müşteriyi Pasife Al"
                : "Müşteriyi Aktifleştir"}
            </DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              {statusActionTarget?.client.companyName ?? "Seçili müşteri"} için durum değişikliği uygulanacaktır.
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

      <Dialog
        open={Boolean(assignmentTargetClient)}
        onOpenChange={(open) => {
          if (!open) {
            closeAssignmentDialog();
          }
        }}
      >
        <DialogContent className="border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>Çalışan Ata</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              {assignmentTargetClient
                ? `${assignmentTargetClient.companyName} müşterisi için aktif çalışan ataması oluşturun.`
                : "Müşteri için çalışan ataması oluşturun."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4" noValidate>
            {assignmentSubmitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {assignmentSubmitError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="client-assignment-scope">Atama Kapsamı</Label>
              <SelectControl
                id="client-assignment-scope"
                ariaLabel="Atama Kapsamı"
                value={assignmentForm.scope}
                onChange={(value) =>
                  setAssignmentForm((previous) => ({
                    ...previous,
                    scope: value as AdminAssignmentScope,
                  }))
                }
                disabled={isCreatingAssignment}
              >
                {ADMIN_ASSIGNMENT_SCOPE_OPTIONS.map((scopeOption) => (
                  <option key={scopeOption} value={scopeOption}>
                    {getAssignmentScopeLabel(scopeOption)}
                  </option>
                ))}
              </SelectControl>
            </div>

            <AssignmentEmployeePicker
              idPrefix="client-assignment-employee"
              selectedEmployee={assignmentForm.employee}
              onSelect={(employee) =>
                setAssignmentForm((previous) => ({ ...previous, employee }))
              }
              onClear={() =>
                setAssignmentForm((previous) => ({ ...previous, employee: null }))
              }
              disabled={isCreatingAssignment || !canReadAdminUsers}
              helperText={
                canReadAdminUsers
                  ? undefined
                  : "Çalışan listesini görmek için `users.manage` yetkisi gerekir."
              }
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeAssignmentDialog}
                disabled={isCreatingAssignment}
              >
                Vazgeç
              </Button>
              <Button
                type="submit"
                className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                disabled={isCreatingAssignment || !canManageAssignments}
                title={
                  canManageAssignments
                    ? undefined
                    : "Bu işlem için assignments.manage yetkisi gerekir."
                }
              >
                {isCreatingAssignment ? "Kaydediliyor..." : "Atamayı Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClientFormFields({
  idPrefix,
  form,
  onChange,
  disabled,
  includeOwnerFields = false,
  canLinkExistingOwner = true,
  selectedExistingOwner = null,
  existingOwnerError = null,
  onExistingOwnerSelect,
  onExistingOwnerClear,
}: {
  idPrefix: string;
  form: ClientFormState;
  onChange: (field: ClientFormField, value: ClientFormValue) => void;
  disabled: boolean;
  includeOwnerFields?: boolean;
  canLinkExistingOwner?: boolean;
  selectedExistingOwner?: AdminUser | null;
  existingOwnerError?: string | null;
  onExistingOwnerSelect?: (owner: AdminUser) => void;
  onExistingOwnerClear?: () => void;
}) {
  const handleExistingOwnerSelect =
    onExistingOwnerSelect ?? ((owner: AdminUser) => onChange("existingOwnerUserId", owner.id));
  const handleExistingOwnerClear =
    onExistingOwnerClear ?? (() => onChange("existingOwnerUserId", ""));

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Müşteri Adı</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          className="border-white/[0.08] bg-[#202020]"
          placeholder="Acme E-ticaret"
          required
          minLength={2}
          maxLength={160}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-slug`}>Portal Slug</Label>
        <Input
          id={`${idPrefix}-slug`}
          value={form.slug}
          onChange={(event) => onChange("slug", event.target.value)}
          className="border-white/[0.08] bg-[#202020]"
          placeholder="acme-e-ticaret"
          maxLength={80}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-status`}>Durum</Label>
        <SelectControl
          id={`${idPrefix}-status`}
          ariaLabel="Durum"
          value={form.status}
          onChange={(value) => onChange("status", value as ClientStatus)}
          disabled={disabled}
        >
          {CLIENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {getClientStatusLabel(status)}
            </option>
          ))}
        </SelectControl>
      </div>

      <ServiceCheckboxGroup
        idPrefix={idPrefix}
        selectedServices={form.purchasedServices}
        disabled={disabled}
        onToggle={(serviceKey) => {
          onChange("purchasedServices", toggleServiceSelection(form.purchasedServices, serviceKey));
        }}
      />

      {isAmazonAdsSelected(form.purchasedServices) && (
        <AmazonAdsConfigFields
          idPrefix={idPrefix}
          form={form}
          disabled={disabled}
          onChange={onChange}
        />
      )}

      {isSocialMediaSelected(form.purchasedServices) && (
        <SocialMediaConfigFields
          idPrefix={idPrefix}
          form={form}
          disabled={disabled}
          onChange={onChange}
        />
      )}

      {includeOwnerFields && (
        <>
          <div className="space-y-2 border-t border-white/[0.06] pt-4">
            <Label htmlFor={`${idPrefix}-owner-mode`}>Sahip İşlemi</Label>
            <SelectControl
              id={`${idPrefix}-owner-mode`}
              ariaLabel="Sahip İşlemi"
              value={form.ownerMode}
              onChange={(value) => onChange("ownerMode", value as ClientOwnerMode)}
              disabled={disabled}
            >
              <option value="NONE">Sahip Ekleme Yok</option>
              <option value="CREATE">Yeni Portal Sahibi Oluştur</option>
              <option value="LINK_EXISTING" disabled={!canLinkExistingOwner}>
                Mevcut Kullanıcı Bağla
              </option>
            </SelectControl>
            {!canLinkExistingOwner && (
              <p className="text-xs text-[#A0A0A0]">
                Mevcut kullanıcı bağlama için `users.manage` yetkisi gerekir.
              </p>
            )}
          </div>

          {form.ownerMode === "CREATE" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-owner-email`}>Sahip E-posta</Label>
                <Input
                  id={`${idPrefix}-owner-email`}
                  type="email"
                  value={form.ownerEmail}
                  onChange={(event) => onChange("ownerEmail", event.target.value)}
                  className="border-white/[0.08] bg-[#202020]"
                  autoComplete="email"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-owner-display-name`}>Sahip Adı</Label>
                <Input
                  id={`${idPrefix}-owner-display-name`}
                  value={form.ownerDisplayName}
                  onChange={(event) => onChange("ownerDisplayName", event.target.value)}
                  className="border-white/[0.08] bg-[#202020]"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${idPrefix}-owner-password`}>Geçici Şifre</Label>
                <Input
                  id={`${idPrefix}-owner-password`}
                  type="password"
                  value={form.ownerPassword}
                  onChange={(event) => onChange("ownerPassword", event.target.value)}
                  className="border-white/[0.08] bg-[#202020]"
                  autoComplete="new-password"
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {form.ownerMode === "LINK_EXISTING" && (
            <ClientOwnerPicker
              idPrefix={idPrefix}
              selectedOwner={selectedExistingOwner}
              selectedUserId={form.existingOwnerUserId}
              error={existingOwnerError}
              disabled={disabled}
              onSelect={handleExistingOwnerSelect}
              onClear={handleExistingOwnerClear}
            />
          )}
        </>
      )}
    </>
  );
}

function ServiceCheckboxGroup({
  idPrefix,
  selectedServices,
  disabled,
  onToggle,
}: {
  idPrefix: string;
  selectedServices: ServiceKey[];
  disabled: boolean;
  onToggle: (serviceKey: ServiceKey) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-white/[0.06] bg-[#202020]/60 p-3">
      <legend className="px-1 text-sm font-medium text-white">Satın Alınan Hizmetler</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SERVICE_CATALOG.map((service) => {
          const checkboxId = `${idPrefix}-service-${service.key}`;
          const checked = selectedServices.includes(service.key);

          return (
            <label
              key={service.key}
              htmlFor={checkboxId}
              className="flex min-h-10 items-center gap-3 rounded-md border border-white/[0.06] bg-[#1A1A1A] px-3 py-2 text-sm text-white"
            >
              <Checkbox
                id={checkboxId}
                checked={checked}
                onCheckedChange={() => onToggle(service.key)}
                disabled={disabled}
                className="border-white/[0.18] data-[state=checked]:border-[#AAFF01] data-[state=checked]:bg-[#AAFF01] data-[state=checked]:text-[#131313]"
              />
              <span>{service.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function AmazonAdsConfigFields({
  idPrefix,
  form,
  disabled,
  onChange,
}: {
  idPrefix: string;
  form: ClientFormState;
  disabled: boolean;
  onChange: (field: ClientFormField, value: ClientFormValue) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-[#AAFF01]/20 bg-[#202020]/60 p-3">
      <legend className="px-1 text-sm font-medium text-white">Amazon Ads Yapılandırması</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-profile-id`}>Profile ID</Label>
          <Input
            id={`${idPrefix}-amazon-profile-id`}
            value={form.amazonProfileId}
            onChange={(event) => onChange("amazonProfileId", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Amazon profile ID"
            maxLength={120}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-advertiser-account-id`}>
            Advertiser Account ID
          </Label>
          <Input
            id={`${idPrefix}-amazon-advertiser-account-id`}
            value={form.amazonAdvertiserAccountId}
            onChange={(event) => onChange("amazonAdvertiserAccountId", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Advertiser account ID"
            maxLength={120}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-marketplace-id`}>Marketplace ID</Label>
          <Input
            id={`${idPrefix}-amazon-marketplace-id`}
            value={form.amazonMarketplaceId}
            onChange={(event) => onChange("amazonMarketplaceId", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="örn. ATVPDKIKX0DER"
            maxLength={80}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-region`}>Region</Label>
          <SelectControl
            id={`${idPrefix}-amazon-region`}
            ariaLabel="Amazon Ads Region"
            value={form.amazonRegion}
            onChange={(value) => onChange("amazonRegion", value as "" | AmazonAdsRegion)}
            disabled={disabled}
          >
            <option value="">Seçilmedi</option>
            <option value="NA">NA</option>
            <option value="EU">EU</option>
            <option value="FE">FE</option>
          </SelectControl>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-country-code`}>Country Code</Label>
          <Input
            id={`${idPrefix}-amazon-country-code`}
            value={form.amazonCountryCode}
            onChange={(event) => onChange("amazonCountryCode", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="TR"
            maxLength={2}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-currency-code`}>Currency Code</Label>
          <Input
            id={`${idPrefix}-amazon-currency-code`}
            value={form.amazonCurrencyCode}
            onChange={(event) => onChange("amazonCurrencyCode", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="TRY"
            maxLength={3}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-timezone`}>Timezone</Label>
          <Input
            id={`${idPrefix}-amazon-timezone`}
            value={form.amazonTimezone}
            onChange={(event) => onChange("amazonTimezone", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Europe/Istanbul"
            maxLength={80}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-account-type`}>Account Type</Label>
          <Input
            id={`${idPrefix}-amazon-account-type`}
            value={form.amazonAccountType}
            onChange={(event) => onChange("amazonAccountType", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="seller / vendor"
            maxLength={80}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-account-name`}>Account Name</Label>
          <Input
            id={`${idPrefix}-amazon-account-name`}
            value={form.amazonAccountName}
            onChange={(event) => onChange("amazonAccountName", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Amazon hesap adı"
            maxLength={160}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amazon-payment-method`}>Payment Method</Label>
          <SelectControl
            id={`${idPrefix}-amazon-payment-method`}
            ariaLabel="Amazon Ads Payment Method"
            value={form.amazonValidPaymentMethod}
            onChange={(value) =>
              onChange("amazonValidPaymentMethod", value as AmazonAdsPaymentMethodState)
            }
            disabled={disabled}
          >
            <option value="">Belirtilmedi</option>
            <option value="true">Geçerli</option>
            <option value="false">Geçerli Değil</option>
          </SelectControl>
        </div>
      </div>
    </fieldset>
  );
}

function SocialMediaConfigFields({
  idPrefix,
  form,
  disabled,
  onChange,
}: {
  idPrefix: string;
  form: ClientFormState;
  disabled: boolean;
  onChange: (field: ClientFormField, value: ClientFormValue) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-[#AAFF01]/20 bg-[#202020]/60 p-3">
      <legend className="px-1 text-sm font-medium text-white">Social Media Yapılandırması</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-social-instagram-username`}>Instagram Username</Label>
          <Input
            id={`${idPrefix}-social-instagram-username`}
            value={form.socialInstagramUsername}
            onChange={(event) => onChange("socialInstagramUsername", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="@socialtech"
            maxLength={120}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-social-instagram-account-id`}>
            Instagram Account ID
          </Label>
          <Input
            id={`${idPrefix}-social-instagram-account-id`}
            value={form.socialInstagramAccountId}
            onChange={(event) => onChange("socialInstagramAccountId", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Instagram account ID"
            maxLength={120}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-social-facebook-page-id`}>Facebook Page ID</Label>
          <Input
            id={`${idPrefix}-social-facebook-page-id`}
            value={form.socialFacebookPageId}
            onChange={(event) => onChange("socialFacebookPageId", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Facebook page ID"
            maxLength={120}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-social-tiktok-username`}>TikTok Username</Label>
          <Input
            id={`${idPrefix}-social-tiktok-username`}
            value={form.socialTiktokUsername}
            onChange={(event) => onChange("socialTiktokUsername", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="@socialtech"
            maxLength={120}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-social-linkedin-page-url`}>LinkedIn Page URL</Label>
          <Input
            id={`${idPrefix}-social-linkedin-page-url`}
            value={form.socialLinkedinPageUrl}
            onChange={(event) => onChange("socialLinkedinPageUrl", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="https://www.linkedin.com/company/socialtech"
            maxLength={240}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-social-content-frequency`}>Content Frequency</Label>
          <Input
            id={`${idPrefix}-social-content-frequency`}
            value={form.socialContentFrequency}
            onChange={(event) => onChange("socialContentFrequency", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Haftada 3 post"
            maxLength={120}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-social-primary-goal`}>Primary Goal</Label>
          <SelectControl
            id={`${idPrefix}-social-primary-goal`}
            ariaLabel="Primary Goal"
            value={form.socialPrimaryGoal}
            onChange={(value) => onChange("socialPrimaryGoal", value as SocialMediaGoalState)}
            disabled={disabled}
          >
            <option value="">Seçilmedi</option>
            {SOCIAL_MEDIA_GOAL_OPTIONS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </SelectControl>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-social-tone-of-voice`}>Tone of Voice</Label>
          <Input
            id={`${idPrefix}-social-tone-of-voice`}
            value={form.socialToneOfVoice}
            onChange={(event) => onChange("socialToneOfVoice", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="Samimi, uzman, dinamik"
            maxLength={160}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-social-hashtags`}>Hashtags</Label>
          <Input
            id={`${idPrefix}-social-hashtags`}
            value={form.socialHashtags}
            onChange={(event) => onChange("socialHashtags", event.target.value)}
            className="border-white/[0.08] bg-[#1A1A1A]"
            placeholder="#growth, #brand, #social"
            maxLength={500}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-social-notes`}>Notes</Label>
          <Textarea
            id={`${idPrefix}-social-notes`}
            value={form.socialNotes}
            onChange={(event) => onChange("socialNotes", event.target.value)}
            className="min-h-24 border-white/[0.08] bg-[#1A1A1A]"
            maxLength={1000}
            disabled={disabled}
          />
        </div>
      </div>
    </fieldset>
  );
}

function ServiceBadgeSummary({
  client,
  expanded = false,
}: {
  client: ClientProfile;
  expanded?: boolean;
}) {
  const activeServices = getActivePurchasedServices(client);

  if (activeServices.length === 0) {
    return <span className="text-sm text-[#A0A0A0]">Hizmet yok</span>;
  }

  const visibleServices = expanded ? activeServices : activeServices.slice(0, 2);
  const remainingCount = activeServices.length - visibleServices.length;

  return (
    <div className="flex flex-wrap items-center gap-2" title={getPurchasedServicesSummary(client)}>
      {visibleServices.map((service) => (
        <Badge key={service.serviceKey} variant="outline" className="border-[#AAFF01]/30 text-[#d2ff8a]">
          {getServiceLabel(service.serviceKey)}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="border-white/[0.12] text-[#A0A0A0]">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

function ClientOwnerPicker({
  idPrefix,
  selectedOwner,
  selectedUserId,
  error,
  disabled,
  onSelect,
  onClear,
}: {
  idPrefix: string;
  selectedOwner: AdminUser | null;
  selectedUserId: string;
  error: string | null;
  disabled: boolean;
  onSelect: (owner: AdminUser) => void;
  onClear: () => void;
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

  const ownerQuery = useMemo<AdminUsersListQuery>(
    () => ({
      accountType: "CLIENT",
      limit: OWNER_PICKER_LIMIT,
      search: search.length > 0 ? search : undefined,
    }),
    [search],
  );

  const {
    data: ownersResponse,
    error: ownersError,
    isError: isOwnersError,
    isFetching: isOwnersFetching,
    isLoading: isOwnersLoading,
    refetch,
  } = useGetAdminUsersQuery(ownerQuery);

  const owners = (ownersResponse?.data ?? []).filter(
    (owner) => owner.accountType === "CLIENT" && !owner.clientProfile?.id,
  );
  const fieldErrorId = `${idPrefix}-existing-owner-error`;
  const hasSelectedOwner = Boolean(selectedUserId);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-existing-owner-search`}>Mevcut Kullanıcı Ara</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
          <Input
            id={`${idPrefix}-existing-owner-search`}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="border-white/[0.08] bg-[#202020] pl-10"
            placeholder="E-posta veya ad ile client kullanıcısı ara..."
            aria-invalid={Boolean(error)}
            aria-describedby={error ? fieldErrorId : undefined}
            disabled={disabled}
          />
        </div>
        {error && (
          <p id={fieldErrorId} className="text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      {hasSelectedOwner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#AAFF01] text-[#131313]">Seçili</Badge>
              <span className="truncate text-sm font-medium text-white">
                {selectedOwner ? formatOwnerDisplayName(selectedOwner) : shortId(selectedUserId)}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-[#d2ff8a]">
              {selectedOwner ? selectedOwner.email : selectedUserId}
            </p>
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
      )}

      <div className="rounded-lg border border-white/[0.06] bg-[#202020]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 text-xs text-[#A0A0A0]">
          <span>Client kullanıcıları</span>
          {isOwnersFetching && !isOwnersLoading && <span>Güncelleniyor...</span>}
        </div>

        {isOwnersLoading && (
          <div className="px-3 py-4 text-sm text-[#A0A0A0]">Kullanıcılar yükleniyor...</div>
        )}

        {!isOwnersLoading && isOwnersError && (
          <div className="space-y-3 px-3 py-4 text-sm text-red-200">
            <p>{extractApiErrorMessage(ownersError, "Client kullanıcıları alınamadı.")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {!isOwnersLoading && !isOwnersError && owners.length === 0 && (
          <div className="px-3 py-4 text-sm text-[#A0A0A0]">
            {search.length > 0
              ? "Aramaya uygun client kullanıcısı bulunamadı."
              : "Bağlanabilecek client kullanıcısı bulunamadı."}
          </div>
        )}

        {!isOwnersLoading && !isOwnersError && owners.length > 0 && (
          <div className="divide-y divide-white/[0.06]">
            {owners.map((owner) => {
              const isSelected = selectedUserId === owner.id;

              return (
                <button
                  key={owner.id}
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected ? "bg-[#AAFF01]/10" : ""
                  }`}
                  onClick={() => onSelect(owner)}
                  disabled={disabled}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {formatOwnerDisplayName(owner)}
                    </span>
                    <span className="block truncate text-xs text-[#A0A0A0]">
                      {owner.email}
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
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentEmployeePicker({
  idPrefix,
  selectedEmployee,
  onSelect,
  onClear,
  disabled,
  helperText,
}: {
  idPrefix: string;
  selectedEmployee: AdminUser | null;
  onSelect: (employee: AdminUser) => void;
  onClear: () => void;
  disabled: boolean;
  helperText?: string;
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

  const employeeQuery = useMemo<AdminUsersListQuery>(
    () => ({
      accountType: "EMPLOYEE",
      isActive: true,
      limit: EMPLOYEE_PICKER_LIMIT,
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
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-search`}>Çalışan Ara</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
          <Input
            id={`${idPrefix}-search`}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="border-white/[0.08] bg-[#202020] pl-10"
            placeholder="Çalışan adı veya e-posta ara..."
            disabled={disabled}
          />
        </div>
      </div>

      {helperText && <p className="text-xs text-[#A0A0A0]">{helperText}</p>}

      {selectedEmployee && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#AAFF01] text-[#131313]">Seçili çalışan</Badge>
              <span className="truncate text-sm font-medium text-white">
                {formatOwnerDisplayName(selectedEmployee)}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-[#d2ff8a]">
              {selectedEmployee.email} · {getRoleLabel(selectedEmployee.role)}
            </p>
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
      )}

      <div className="rounded-lg border border-white/[0.06] bg-[#202020]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 text-xs text-[#A0A0A0]">
          <span>Aktif çalışanlar</span>
          {isEmployeesFetching && !isEmployeesLoading && <span>Güncelleniyor...</span>}
        </div>

        {isEmployeesLoading && (
          <div className="px-3 py-4 text-sm text-[#A0A0A0]">Çalışanlar yükleniyor...</div>
        )}

        {!isEmployeesLoading && isEmployeesError && (
          <div className="space-y-3 px-3 py-4 text-sm text-red-200">
            <p>{extractApiErrorMessage(employeesError, "Çalışanlar alınamadı.")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {!isEmployeesLoading && !isEmployeesError && employees.length === 0 && (
          <div className="px-3 py-4 text-sm text-[#A0A0A0]">
            {search.length > 0 ? "Aramaya uygun çalışan bulunamadı." : "Aktif çalışan bulunamadı."}
          </div>
        )}

        {!isEmployeesLoading && !isEmployeesError && employees.length > 0 && (
          <div className="max-h-56 divide-y divide-white/[0.06] overflow-y-auto">
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
                  aria-label={`Çalışanı seç: ${formatOwnerDisplayName(employee)} ${employee.email}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {formatOwnerDisplayName(employee)}
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
          </div>
        )}
      </div>
    </div>
  );
}

function formatOwnerDisplayName(owner: AdminUser): string {
  const displayName = owner.displayName?.trim();

  if (displayName) {
    return displayName;
  }

  return "İsim belirtilmedi";
}

function SelectControl({
  id,
  ariaLabel,
  value,
  onChange,
  children,
  disabled = false,
}: {
  id?: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="h-10 w-full rounded-md border border-white/[0.06] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

function PaginationFooter({
  meta,
  isFetching,
  onPrevious,
  onNext,
}: {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const startRecord = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endRecord = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 text-sm text-[#A0A0A0]">
      <span>
        {startRecord}-{endRecord} / {meta.total} kayıt
      </span>
      <div className="flex items-center gap-3">
        <span>
          Sayfa {meta.page} / {meta.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!meta.hasPreviousPage || isFetching}
            onClick={onPrevious}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!meta.hasNextPage || isFetching}
            onClick={onNext}
            className="gap-1"
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function validateClientForm(
  form: ClientFormState,
  includeOwnerFields: boolean,
  canLinkExistingOwner: boolean,
): string | null {
  const nameError = validateClientName(form.name);
  if (nameError) {
    return nameError;
  }

  const slugError = validateClientSlug(form.slug);
  if (slugError) {
    return slugError;
  }

  if (!CLIENT_STATUS_OPTIONS.includes(form.status)) {
    return "Geçerli bir müşteri durumu seçin.";
  }

  if (form.purchasedServices.length === 0) {
    return "En az bir satın alınan hizmet seçin.";
  }

  if (!includeOwnerFields || form.ownerMode === "NONE") {
    return null;
  }

  if (form.ownerMode === "CREATE") {
    return (
      validateClientOwnerEmail(form.ownerEmail) ??
      validateClientOwnerDisplayName(form.ownerDisplayName) ??
      validateClientOwnerPassword(form.ownerPassword)
    );
  }

  if (form.ownerMode === "LINK_EXISTING" && !canLinkExistingOwner) {
    return "Bu hesapta mevcut kullanıcı bağlama yetkisi bulunmuyor.";
  }

  if (form.ownerMode === "LINK_EXISTING" && !form.existingOwnerUserId.trim()) {
    return EXISTING_OWNER_REQUIRED_MESSAGE;
  }

  return null;
}

function buildCreateClientPayload(form: ClientFormState): CreateAdminClientRequest {
  const payload: CreateAdminClientRequest = {
    name: form.name.trim(),
    status: form.status,
    purchasedServices: form.purchasedServices,
  };
  const slug = normalizeOptionalText(form.slug);

  if (slug) {
    payload.slug = slug;
  }

  return payload;
}

function buildUpdateClientPayload(form: ClientFormState): UpdateAdminClientRequest {
  const payload: UpdateAdminClientRequest = {
    name: form.name.trim(),
    status: form.status,
    purchasedServices: form.purchasedServices,
  };
  const slug = normalizeOptionalText(form.slug);

  if (slug) {
    payload.slug = slug;
  }

  return payload;
}

function buildAmazonAdsConfigPayload(
  form: ClientFormState,
): UpdateAdminClientAmazonAdsConfigRequest | null {
  if (!isAmazonAdsSelected(form.purchasedServices)) {
    return null;
  }

  const payload: UpdateAdminClientAmazonAdsConfigRequest = {};
  addOptionalAmazonAdsText(payload, "profileId", form.amazonProfileId);
  addOptionalAmazonAdsText(payload, "advertiserAccountId", form.amazonAdvertiserAccountId);
  addOptionalAmazonAdsText(payload, "marketplaceId", form.amazonMarketplaceId);
  addOptionalAmazonAdsText(payload, "countryCode", form.amazonCountryCode.toUpperCase());
  addOptionalAmazonAdsText(payload, "currencyCode", form.amazonCurrencyCode.toUpperCase());
  addOptionalAmazonAdsText(payload, "timezone", form.amazonTimezone);
  addOptionalAmazonAdsText(payload, "accountType", form.amazonAccountType);
  addOptionalAmazonAdsText(payload, "accountName", form.amazonAccountName);

  if (form.amazonRegion) {
    payload.region = form.amazonRegion;
  }

  if (form.amazonValidPaymentMethod !== "") {
    payload.validPaymentMethod = form.amazonValidPaymentMethod === "true";
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

function buildSocialMediaConfigPayload(
  form: ClientFormState,
): UpdateAdminClientSocialMediaConfigRequest | null {
  if (!isSocialMediaSelected(form.purchasedServices)) {
    return null;
  }

  return {
    instagramUsername: normalizeNullableText(form.socialInstagramUsername),
    instagramAccountId: normalizeNullableText(form.socialInstagramAccountId),
    facebookPageId: normalizeNullableText(form.socialFacebookPageId),
    tiktokUsername: normalizeNullableText(form.socialTiktokUsername),
    linkedinPageUrl: normalizeNullableText(form.socialLinkedinPageUrl),
    contentFrequency: normalizeNullableText(form.socialContentFrequency),
    primaryGoal: form.socialPrimaryGoal || null,
    toneOfVoice: normalizeNullableText(form.socialToneOfVoice),
    hashtags: normalizeSocialMediaHashtags(form.socialHashtags),
    notes: normalizeNullableText(form.socialNotes),
  };
}

function buildOwnerPayload(form: ClientFormState): CreateOrLinkClientOwnerRequest | null {
  if (form.ownerMode === "CREATE") {
    return {
      mode: "CREATE",
      email: form.ownerEmail.trim().toLowerCase(),
      displayName: form.ownerDisplayName.trim(),
      password: form.ownerPassword,
    };
  }

  if (form.ownerMode === "LINK_EXISTING") {
    return {
      mode: "LINK_EXISTING",
      userId: form.existingOwnerUserId.trim(),
    };
  }

  return null;
}

function clientToForm(client: ClientProfile): ClientFormState {
  return {
    ...initialClientForm,
    name: client.companyName,
    slug: client.slug,
    status: client.status,
    purchasedServices: getActivePurchasedServiceKeys(client),
  };
}

function toggleServiceSelection(selectedServices: ServiceKey[], serviceKey: ServiceKey): ServiceKey[] {
  if (selectedServices.includes(serviceKey)) {
    return selectedServices.filter((selectedService) => selectedService !== serviceKey);
  }

  return [...selectedServices, serviceKey];
}

function isAmazonAdsSelected(selectedServices: ServiceKey[]): boolean {
  return selectedServices.includes("amazon-ads");
}

function isSocialMediaSelected(selectedServices: ServiceKey[]): boolean {
  return selectedServices.includes("social-media");
}

function addOptionalAmazonAdsText<K extends keyof UpdateAdminClientAmazonAdsConfigRequest>(
  payload: UpdateAdminClientAmazonAdsConfigRequest,
  key: K,
  value: string,
): void {
  const normalizedValue = value.trim();
  if (normalizedValue.length > 0) {
    payload[key] = normalizedValue as UpdateAdminClientAmazonAdsConfigRequest[K];
  }
}

function normalizeOptionalText(value: string): string | undefined {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function normalizeNullableText(value: string): string | null {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeSocialMediaHashtags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item, index, items) => item.length > 0 && items.indexOf(item) === index)
    .slice(0, 30);
}

function socialMediaConfigToFormFields(
  config: AdminClientSocialMediaConfig,
): Partial<ClientFormState> {
  return {
    socialInstagramUsername: config.instagramUsername ?? "",
    socialInstagramAccountId: config.instagramAccountId ?? "",
    socialFacebookPageId: config.facebookPageId ?? "",
    socialTiktokUsername: config.tiktokUsername ?? "",
    socialLinkedinPageUrl: config.linkedinPageUrl ?? "",
    socialContentFrequency: config.contentFrequency ?? "",
    socialPrimaryGoal: config.primaryGoal ?? "",
    socialToneOfVoice: config.toneOfVoice ?? "",
    socialHashtags: config.hashtags.join(", "),
    socialNotes: config.notes ?? "",
  };
}

function getMetricValue(value: number, isLoading: boolean, isError: boolean): string {
  if (isError) {
    return "--";
  }

  if (isLoading) {
    return "...";
  }

  return value.toLocaleString("tr-TR");
}

function isDateInCurrentMonth(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isWithinLastDays(value: string, days: number): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const differenceMs = Date.now() - date.getTime();
  return differenceMs >= 0 && differenceMs <= days * 86_400_000;
}
