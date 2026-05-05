import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, FolderKanban, Github, Link2, FolderPlus, MessageSquare, CalendarCheck2, ClipboardList } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  hasAdminPermission,
  hasUserPermission,
  selectAccessToken,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import {
  projectsApi,
  useDeleteProjectRepositoryMutation,
  useCreateProjectFileFolderMutation,
  useGetProjectFileFoldersQuery,
  useGetProjectFileFolderAssigneesQuery,
  useGetProjectFilesQuery,
  useGetProjectQuery,
  useGetProjectRepositoryBranchesQuery,
  useGetProjectRepositoryCommitsQuery,
  useGetProjectRepositoryPullsQuery,
  useGetProjectRepositoryQuery,
  useGetProjectRepositoryWorkflowRunsQuery,
  useUpdateProjectFileFolderMutation,
  useUpdateProjectFileFolderAssigneesMutation,
  useUpsertProjectRepositoryMutation,
  useGetProjectWorkspaceSnapshotQuery,
  useCreateProjectWorkspaceSectionMutation,
  useCreateProjectWorkspaceItemMutation,
  useGetProjectWorkspaceRevisionsQuery,
  useUpdateProjectWorkspaceRevisionStatusMutation,
  useGetProjectWorkspaceReportsQuery,
  useCreateProjectWorkspaceReportMutation,
  useGetProjectWorkspaceMeetingRequestsQuery,
  useUpdateProjectWorkspaceMeetingRequestMutation,
  useGetProjectWorkspaceMessagesQuery,
  useCreateProjectWorkspaceMessageMutation,
} from "../features/projects/projectsApi";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
  getPriorityBadgeClass,
  getPriorityLabel,
  getProjectClientName,
  getProjectServiceLabel,
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
  isUuid,
  projectRequiresRepository,
} from "../features/projects/projectsUtils";
import type {
  WorkspaceContentItem,
  WorkspaceMeetingRequest,
  WorkspaceMeetingRequestStatus,
  WorkspaceMessage,
  WorkspaceRevision,
  WorkspaceRevisionStatus,
  WorkspaceSection,
  WorkspaceTabKey,
  WorkspaceWeeklyReport,
} from "../features/projects/projectsTypes";
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from "../features/projects/workspaceSocket";

const WORKSPACE_TAB_OPTIONS: WorkspaceTabKey[] = [
  "OVERVIEW",
  "TASKS",
  "DELIVERY",
  "FILES",
  "CONTENT",
  "MESSAGES",
  "REVISIONS",
  "REPORTS",
  "MEETINGS",
];

const REVISION_STATUS_OPTIONS: WorkspaceRevisionStatus[] = [
  "REQUESTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "READY_FOR_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const MEETING_STATUS_OPTIONS: WorkspaceMeetingRequestStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "DECLINED",
  "COMPLETED",
  "CANCELLED",
];

export function ProjectDetail() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);
  const isEmployeeScope = location.pathname.startsWith("/employee/");
  const listPath = isEmployeeScope ? "/employee/projeler" : "/projeler";
  const canReadProjects = hasUserPermission(currentUser, [
    "projects.read.any",
    "projects.manage.any",
    "projects.read",
    "projects.read.assigned",
  ]);
  const canManageRepository = hasAdminPermission(currentUser, ["integrations.github.manage.any"]);
  const canReadRepository = hasUserPermission(currentUser, [
    "integrations.github.read.any",
    "integrations.github.manage.any",
    "integrations.github.read.assigned",
  ]);
  const canReadWorkspace = hasUserPermission(currentUser, [
    "webapp.workspace.read.any",
    "webapp.workspace.manage.any",
    "webapp.workspace.read.assigned",
    "webapp.workspace.manage.assigned",
  ]);
  const canManageWorkspace = hasUserPermission(currentUser, [
    "webapp.workspace.manage.any",
    "webapp.workspace.manage.assigned",
  ]);
  const canInteractWorkspace = hasUserPermission(currentUser, [
    "webapp.workspace.interact.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.manage.any",
  ]);
  const [repositoryForm, setRepositoryForm] = useState({
    owner: "",
    repo: "",
    defaultBranch: "",
    installationId: "",
    accessToken: "",
  });
  const [repositoryFeedback, setRepositoryFeedback] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [selectedFolderForAssignment, setSelectedFolderForAssignment] = useState("");
  const [filesFeedback, setFilesFeedback] = useState<string | null>(null);
  const [workspaceFeedback, setWorkspaceFeedback] = useState<string | null>(null);
  const [selectedWorkspaceTab, setSelectedWorkspaceTab] = useState<WorkspaceTabKey>("OVERVIEW");
  const [sectionForm, setSectionForm] = useState({
    key: "",
    title: "",
    description: "",
  });
  const [itemForm, setItemForm] = useState({
    sectionId: "",
    title: "",
    body: "",
    href: "",
  });
  const [revisionNote, setRevisionNote] = useState<Record<string, string>>({});
  const [reportForm, setReportForm] = useState({
    weekStartDate: "",
    weekEndDate: "",
    summary: "",
    accomplishments: "",
    plannedNext: "",
    blockers: "",
  });
  const [meetingResponseNote, setMeetingResponseNote] = useState<Record<string, string>>({});
  const [messageDraft, setMessageDraft] = useState("");
  const lastWorkspaceSequenceRef = useRef(0);

  const isValidId = typeof id === "string" && isUuid(id);

  const {
    data: project,
    error,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectQuery(id ?? "", {
    skip: !canReadProjects || !isValidId,
  });
  const { data: repository, refetch: refetchRepository } = useGetProjectRepositoryQuery(id ?? "", {
    skip: !canReadRepository || !isValidId || !project,
  });
  const { data: branches } = useGetProjectRepositoryBranchesQuery(
    { projectId: id ?? "" },
    { skip: !repository || !isValidId },
  );
  const { data: commits } = useGetProjectRepositoryCommitsQuery(
    { projectId: id ?? "" },
    { skip: !repository || !isValidId },
  );
  const { data: pulls } = useGetProjectRepositoryPullsQuery(
    { projectId: id ?? "" },
    { skip: !repository || !isValidId },
  );
  const { data: workflowRuns } = useGetProjectRepositoryWorkflowRunsQuery(
    { projectId: id ?? "" },
    { skip: !repository || !isValidId },
  );
  const [upsertRepository, { isLoading: isSavingRepository }] = useUpsertProjectRepositoryMutation();
  const [deleteRepository, { isLoading: isDeletingRepository }] = useDeleteProjectRepositoryMutation();
  const [createProjectFileFolder, { isLoading: isCreatingFolder }] = useCreateProjectFileFolderMutation();
  const [updateProjectFileFolder] = useUpdateProjectFileFolderMutation();
  const [updateProjectFileFolderAssignees, { isLoading: isSavingFolderAssignees }] =
    useUpdateProjectFileFolderAssigneesMutation();
  const { data: projectFolders } = useGetProjectFileFoldersQuery(
    { projectId: id ?? "" },
    { skip: !isValidId || !canReadProjects },
  );
  const activeFolderId = selectedFolderForAssignment || projectFolders?.[0]?.id || "";
  const { data: folderAssignees = [] } = useGetProjectFileFolderAssigneesQuery(
    { projectId: id ?? "", folderId: activeFolderId },
    { skip: !canManageRepository || !isValidId || !activeFolderId },
  );
  const { data: projectFilesResponse, isFetching: isFetchingFiles } = useGetProjectFilesQuery(
    { projectId: id ?? "", limit: 30 },
    { skip: !isValidId || !canReadProjects },
  );
  const repositoryRequired = useMemo(
    () => (project ? projectRequiresRepository(project) : false),
    [project],
  );
  const workspaceEnabled = project?.serviceKey === "web-app";
  const { data: workspaceSnapshot, isFetching: isFetchingWorkspace } = useGetProjectWorkspaceSnapshotQuery(
    { projectId: id ?? "", tabKey: selectedWorkspaceTab },
    { skip: !isValidId || !canReadWorkspace || !workspaceEnabled },
  );
  const { data: workspaceRevisions = [] } = useGetProjectWorkspaceRevisionsQuery(
    { projectId: id ?? "" },
    { skip: !isValidId || !canReadWorkspace || !workspaceEnabled },
  );
  const { data: workspaceReports = [] } = useGetProjectWorkspaceReportsQuery(
    { projectId: id ?? "" },
    { skip: !isValidId || !canReadWorkspace || !workspaceEnabled },
  );
  const { data: workspaceMeetings = [] } = useGetProjectWorkspaceMeetingRequestsQuery(
    { projectId: id ?? "" },
    { skip: !isValidId || !canReadWorkspace || !workspaceEnabled },
  );
  const { data: workspaceMessages = [] } = useGetProjectWorkspaceMessagesQuery(
    { projectId: id ?? "", tabKey: selectedWorkspaceTab },
    { skip: !isValidId || !canReadWorkspace || !workspaceEnabled },
  );
  const [createWorkspaceSection, { isLoading: isCreatingWorkspaceSection }] =
    useCreateProjectWorkspaceSectionMutation();
  const [createWorkspaceItem, { isLoading: isCreatingWorkspaceItem }] =
    useCreateProjectWorkspaceItemMutation();
  const [updateWorkspaceRevisionStatus, { isLoading: isUpdatingRevision }] =
    useUpdateProjectWorkspaceRevisionStatusMutation();
  const [createWorkspaceReport, { isLoading: isCreatingReport }] =
    useCreateProjectWorkspaceReportMutation();
  const [updateWorkspaceMeetingRequest, { isLoading: isUpdatingMeeting }] =
    useUpdateProjectWorkspaceMeetingRequestMutation();
  const [createWorkspaceMessage, { isLoading: isSendingWorkspaceMessage }] =
    useCreateProjectWorkspaceMessageMutation();

  useEffect(() => {
    if (!workspaceEnabled || !id || !accessToken || !canReadWorkspace) {
      return;
    }

    const socket = createWorkspaceSocket(accessToken);
    const joinPayload = { projectId: id, tabKey: selectedWorkspaceTab };

    socket.emit("project:join", joinPayload);

    const onWorkspaceUpdate = (event: WorkspaceUpdateEvent) => {
      if (event.projectId !== id) {
        return;
      }
      if (event.sequence <= lastWorkspaceSequenceRef.current) {
        return;
      }
      lastWorkspaceSequenceRef.current = event.sequence;
      const payload = event.payload ?? {};
      const revision = (payload.revision ?? null) as WorkspaceRevision | null;
      const meetingRequest = (payload.meetingRequest ?? null) as WorkspaceMeetingRequest | null;
      const message = (payload.message ?? null) as WorkspaceMessage | null;
      const section = (payload.section ?? null) as WorkspaceSection | null;
      const contentItem = (payload.contentItem ?? null) as WorkspaceContentItem | null;
      const sectionId = typeof payload.sectionId === "string" ? payload.sectionId : null;
      const weeklyReport = (payload.weeklyReport ?? null) as WorkspaceWeeklyReport | null;

      if (event.event === "message.created" && message) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceMessages",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const exists = draft.some((item) => item.id === message.id);
              if (!exists) {
                draft.unshift(message);
              }
            },
          ),
        );
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const exists = draft.messages.some((item) => item.id === message.id);
              if (!exists) {
                draft.messages.unshift(message);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "revision.created" && revision) {
        dispatch(
          projectsApi.util.updateQueryData("getProjectWorkspaceRevisions", { projectId: id }, (draft) => {
            const exists = draft.some((item) => item.id === revision.id);
            if (!exists) {
              draft.unshift(revision);
            }
          }),
        );
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const exists = draft.revisions.some((item) => item.id === revision.id);
              if (!exists) {
                draft.revisions.unshift(revision);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "revision.updated" && revision) {
        dispatch(
          projectsApi.util.updateQueryData("getProjectWorkspaceRevisions", { projectId: id }, (draft) => {
            const target = draft.find((item) => item.id === revision.id);
            if (target) {
              Object.assign(target, revision);
            }
          }),
        );
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const target = draft.revisions.find((item) => item.id === revision.id);
              if (target) {
                Object.assign(target, revision);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "meeting-request.created" && meetingRequest) {
        dispatch(
          projectsApi.util.updateQueryData("getProjectWorkspaceMeetingRequests", { projectId: id }, (draft) => {
            const exists = draft.some((item) => item.id === meetingRequest.id);
            if (!exists) {
              draft.unshift(meetingRequest);
            }
          }),
        );
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const exists = draft.meetingRequests.some((item) => item.id === meetingRequest.id);
              if (!exists) {
                draft.meetingRequests.unshift(meetingRequest);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "meeting-request.updated" && meetingRequest) {
        dispatch(
          projectsApi.util.updateQueryData("getProjectWorkspaceMeetingRequests", { projectId: id }, (draft) => {
            const target = draft.find((item) => item.id === meetingRequest.id);
            if (target) {
              Object.assign(target, meetingRequest);
            }
          }),
        );
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const target = draft.meetingRequests.find((item) => item.id === meetingRequest.id);
              if (target) {
                Object.assign(target, meetingRequest);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "section.created" && section) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const exists = draft.sections.some((item) => item.id === section.id);
              if (!exists) {
                draft.sections.push(section);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "section.updated" && section) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const target = draft.sections.find((item) => item.id === section.id);
              if (target) {
                Object.assign(target, section);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "content-item.created" && contentItem && sectionId) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const targetSection = draft.sections.find((item) => item.id === sectionId);
              if (!targetSection) {
                return;
              }
              const exists = targetSection.items.some((item) => item.id === contentItem.id);
              if (!exists) {
                targetSection.items.push(contentItem);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "content-item.updated" && contentItem && sectionId) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const targetSection = draft.sections.find((item) => item.id === sectionId);
              if (!targetSection) {
                return;
              }
              const targetItem = targetSection.items.find((item) => item.id === contentItem.id);
              if (targetItem) {
                Object.assign(targetItem, contentItem);
              }
            },
          ),
        );
        return;
      }

      if (event.event === "weekly-report.created" && weeklyReport) {
        dispatch(
          projectsApi.util.updateQueryData("getProjectWorkspaceReports", { projectId: id }, (draft) => {
            const exists = draft.some((item) => item.id === weeklyReport.id);
            if (!exists) {
              draft.unshift(weeklyReport);
            }
          }),
        );
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceSnapshot",
            { projectId: id, tabKey: selectedWorkspaceTab },
            (draft) => {
              const exists = draft.weeklyReports.some((item) => item.id === weeklyReport.id);
              if (!exists) {
                draft.weeklyReports.unshift(weeklyReport);
              }
            },
          ),
        );
      }
    };

    socket.on("workspace:update", onWorkspaceUpdate);

    return () => {
      socket.emit("project:leave", joinPayload);
      socket.off("workspace:update", onWorkspaceUpdate);
      socket.disconnect();
    };
  }, [accessToken, canReadWorkspace, dispatch, id, selectedWorkspaceTab, workspaceEnabled]);

  if (!canReadProjects) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfaya erişim yetkiniz bulunmuyor.
      </Card>
    );
  }

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
          Geçersiz proje kimliği.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
        Proje detayı yükleniyor...
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {extractApiErrorMessage(error, "Proje detayı yüklenemedi. Lütfen tekrar deneyin.")}
          <div className="mt-4">
            <Button variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Proje kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  const saveRepository = async () => {
    if (!id) {
      return;
    }

    try {
      setRepositoryFeedback(null);
      await upsertRepository({
        projectId: id,
        body: {
          owner: repositoryForm.owner,
          repo: repositoryForm.repo,
          defaultBranch: repositoryForm.defaultBranch || null,
          installationId: repositoryForm.installationId || null,
          accessToken: repositoryForm.accessToken || null,
        },
      }).unwrap();
      setRepositoryFeedback("GitHub repository bağlantısı güncellendi.");
      setRepositoryForm((prev) => ({ ...prev, accessToken: "" }));
      void refetchRepository();
    } catch (error) {
      setRepositoryFeedback(extractApiErrorMessage(error, "Repository kaydedilemedi."));
    }
  };

  const removeRepository = async () => {
    if (!id) {
      return;
    }

    try {
      setRepositoryFeedback(null);
      await deleteRepository(id).unwrap();
      setRepositoryFeedback("GitHub repository bağlantısı pasifleştirildi.");
      void refetchRepository();
    } catch (error) {
      setRepositoryFeedback(extractApiErrorMessage(error, "Repository kaldırılamadı."));
    }
  };

  const createFolder = async () => {
    if (!id || folderName.trim().length === 0) {
      return;
    }

    try {
      setFilesFeedback(null);
      await createProjectFileFolder({ projectId: id, name: folderName.trim() }).unwrap();
      setFolderName("");
      setFilesFeedback("Klasör oluşturuldu.");
    } catch (error) {
      setFilesFeedback(extractApiErrorMessage(error, "Klasör oluşturulamadı."));
    }
  };

  const createSection = async () => {
    if (!id || sectionForm.key.trim().length === 0 || sectionForm.title.trim().length === 0) {
      return;
    }

    try {
      setWorkspaceFeedback(null);
      await createWorkspaceSection({
        projectId: id,
        tabKey: selectedWorkspaceTab,
        key: sectionForm.key.trim(),
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim() || undefined,
      }).unwrap();
      setSectionForm({ key: "", title: "", description: "" });
      setWorkspaceFeedback("Workspace bölümü oluşturuldu.");
    } catch (error) {
      setWorkspaceFeedback(extractApiErrorMessage(error, "Workspace bölümü oluşturulamadı."));
    }
  };

  const createSectionItem = async () => {
    if (!id || itemForm.sectionId.length === 0 || itemForm.title.trim().length === 0) {
      return;
    }

    try {
      setWorkspaceFeedback(null);
      await createWorkspaceItem({
        projectId: id,
        sectionId: itemForm.sectionId,
        itemType: "TEXT",
        title: itemForm.title.trim(),
        body: itemForm.body.trim() || undefined,
        href: itemForm.href.trim() || undefined,
      }).unwrap();
      setItemForm((prev) => ({ ...prev, title: "", body: "", href: "" }));
      setWorkspaceFeedback("Section item eklendi.");
    } catch (error) {
      setWorkspaceFeedback(extractApiErrorMessage(error, "Section item eklenemedi."));
    }
  };

  const changeRevisionStatus = async (revisionId: string, status: WorkspaceRevisionStatus) => {
    if (!id) {
      return;
    }

    try {
      setWorkspaceFeedback(null);
      await updateWorkspaceRevisionStatus({
        projectId: id,
        revisionId,
        status,
        note: revisionNote[revisionId]?.trim() || undefined,
      }).unwrap();
      setWorkspaceFeedback("Revizyon durumu güncellendi.");
    } catch (error) {
      setWorkspaceFeedback(extractApiErrorMessage(error, "Revizyon durumu güncellenemedi."));
    }
  };

  const createWeeklyReport = async () => {
    if (!id || !reportForm.weekStartDate || !reportForm.weekEndDate || reportForm.summary.trim().length === 0) {
      return;
    }

    try {
      setWorkspaceFeedback(null);
      await createWorkspaceReport({
        projectId: id,
        weekStartDate: reportForm.weekStartDate,
        weekEndDate: reportForm.weekEndDate,
        summary: reportForm.summary.trim(),
        accomplishments: reportForm.accomplishments.trim() || undefined,
        plannedNext: reportForm.plannedNext.trim() || undefined,
        blockers: reportForm.blockers.trim() || undefined,
      }).unwrap();
      setReportForm({
        weekStartDate: "",
        weekEndDate: "",
        summary: "",
        accomplishments: "",
        plannedNext: "",
        blockers: "",
      });
      setWorkspaceFeedback("Haftalık rapor oluşturuldu.");
    } catch (error) {
      setWorkspaceFeedback(extractApiErrorMessage(error, "Haftalık rapor oluşturulamadı."));
    }
  };

  const decideMeetingRequest = async (meetingRequestId: string, status: WorkspaceMeetingRequestStatus) => {
    if (!id) {
      return;
    }

    try {
      setWorkspaceFeedback(null);
      await updateWorkspaceMeetingRequest({
        projectId: id,
        meetingRequestId,
        status,
        responseNote: meetingResponseNote[meetingRequestId]?.trim() || undefined,
      }).unwrap();
      setWorkspaceFeedback("Toplantı talebi güncellendi.");
    } catch (error) {
      setWorkspaceFeedback(extractApiErrorMessage(error, "Toplantı talebi güncellenemedi."));
    }
  };

  const sendWorkspaceMessage = async () => {
    if (!id || !messageDraft.trim()) {
      return;
    }

    try {
      setWorkspaceFeedback(null);
      await createWorkspaceMessage({
        projectId: id,
        tabKey: selectedWorkspaceTab,
        body: messageDraft.trim(),
        isInternal: false,
      }).unwrap();
      setMessageDraft("");
      setWorkspaceFeedback("Mesaj gönderildi.");
    } catch (error) {
      setWorkspaceFeedback(extractApiErrorMessage(error, "Mesaj gönderilemedi."));
    }
  };

  const files = projectFilesResponse?.data ?? [];
  const folders = projectFolders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to={listPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        {isFetching && <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
      </div>

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">{project.name}</h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">{getProjectClientName(project)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.serviceKey && (
              <Badge variant="outline" className="border-[#AAFF01]/30 text-[#d2ff8a]">
                {getProjectServiceLabel(project)}
              </Badge>
            )}
            <Badge className={getProjectStatusBadgeClass(project.status)}>
              {getProjectStatusLabel(project.status)}
            </Badge>
            <Badge className={getPriorityBadgeClass(project.priority)}>
              {getPriorityLabel(project.priority)}
            </Badge>
          </div>
        </div>
        {project.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-[#D8D8D8]">{project.description}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Slug" value={project.slug} />
        <InfoCard label="Müşteri Profil ID" value={project.clientProfileId} mono />
        <InfoCard label="Figma" value={project.figmaProjectUrl ?? "—"} mono={Boolean(project.figmaProjectUrl)} />
        <InfoCard label="Repository Linki" value={project.repositoryUrl ?? "—"} mono={Boolean(project.repositoryUrl)} />
        <InfoCard label="Başlangıç" value={formatDate(project.startDate)} />
        <InfoCard label="Deadline" value={formatDate(project.dueDate)} />
        <InfoCard label="Oluşturulma" value={formatDateTime(project.createdAt)} />
        <InfoCard label="Güncellenme" value={formatDateTime(project.updatedAt)} />
      </div>

      {project.figmaProjectUrl && (
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Figma Projesi</h2>
              <p className="text-sm text-[#A0A0A0]">Tasarım kaynağı</p>
            </div>
            <a
              href={project.figmaProjectUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#d8ff8f] underline-offset-2 hover:underline"
            >
              <Link2 className="h-4 w-4" />
              Figma bağlantısını aç
            </a>
          </div>
        </Card>
      )}

      {project.repositoryUrl && (
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Repository Linki</h2>
              <p className="text-sm text-[#A0A0A0]">Business-level GitHub proje kaydı</p>
            </div>
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#d8ff8f] underline-offset-2 hover:underline"
            >
              Repository bağlantısını aç
            </a>
          </div>
        </Card>
      )}

      {canReadRepository && (
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">GitHub Repository</h2>
              <p className="text-sm text-[#A0A0A0]">Project seviyesinde repository bağlantısı</p>
            </div>
            {repository && (
              <Badge variant="outline">
                {repository.owner}/{repository.repo}
              </Badge>
            )}
          </div>

          {repositoryRequired && (!repository || !project.repositoryUrl) && (
            <div className="mb-6 rounded-xl border border-orange-400/30 bg-orange-500/10 p-4 text-sm text-orange-100">
              <div className="flex items-start gap-3">
                <Github className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">GitHub bağlantısı zorunlu</p>
                  <p className="mt-1 text-orange-100/80">
                    `WEB_APP` ve `MOBILE_APP` projelerinde hem proje repository linki hem de
                    tercihen tokenlı repository entegrasyonu tamamlanmalıdır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {canManageRepository && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="repo-owner">Owner</Label>
                <Input
                  id="repo-owner"
                  value={repositoryForm.owner}
                  onChange={(event) =>
                    setRepositoryForm((prev) => ({ ...prev, owner: event.target.value }))
                  }
                  placeholder={repository?.owner ?? "facebook"}
                />
              </div>
              <div>
                <Label htmlFor="repo-name">Repo</Label>
                <Input
                  id="repo-name"
                  value={repositoryForm.repo}
                  onChange={(event) =>
                    setRepositoryForm((prev) => ({ ...prev, repo: event.target.value }))
                  }
                  placeholder={repository?.repo ?? "react"}
                />
              </div>
              <div>
                <Label htmlFor="repo-branch">Default Branch</Label>
                <Input
                  id="repo-branch"
                  value={repositoryForm.defaultBranch}
                  onChange={(event) =>
                    setRepositoryForm((prev) => ({
                      ...prev,
                      defaultBranch: event.target.value,
                    }))
                  }
                  placeholder={repository?.defaultBranch ?? "main"}
                />
              </div>
              <div>
                <Label htmlFor="repo-installation">GitHub App Installation ID</Label>
                <Input
                  id="repo-installation"
                  value={repositoryForm.installationId}
                  onChange={(event) =>
                    setRepositoryForm((prev) => ({
                      ...prev,
                      installationId: event.target.value,
                    }))
                  }
                  placeholder={repository?.installationId ?? "Opsiyonel"}
                />
              </div>
              <div>
                <Label htmlFor="repo-token">PAT / Token</Label>
                <Input
                  id="repo-token"
                  type="password"
                  value={repositoryForm.accessToken}
                  onChange={(event) =>
                    setRepositoryForm((prev) => ({
                      ...prev,
                      accessToken: event.target.value,
                    }))
                  }
                  placeholder="Yalnızca güncellemek için girin"
                />
              </div>
            </div>
          )}

          {repositoryFeedback && (
            <p className="mb-4 text-sm text-[#d8ff8f]">{repositoryFeedback}</p>
          )}

          {canManageRepository && (
            <div className="mb-6 flex flex-wrap gap-3">
              <Button onClick={() => void saveRepository()} disabled={isSavingRepository}>
                Repository Kaydet
              </Button>
              {repository && (
                <Button
                  variant="outline"
                  onClick={() => void removeRepository()}
                  disabled={isDeletingRepository}
                >
                  Bağlantıyı Pasifleştir
                </Button>
              )}
            </div>
          )}

          {!repository && (
            <p className="text-sm text-[#A0A0A0]">
              Bu proje için henüz repository bağlantısı yok.
            </p>
          )}

          {repository && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <RepositoryListCard
                title="Branches"
                items={(branches ?? []).map((branch) => branch.name)}
              />
              <RepositoryListCard
                title="Recent Commits"
                items={(commits ?? []).map((commit) => commit.message)}
              />
              <RepositoryListCard
                title="Open PRs"
                items={(pulls ?? []).map((pull) => pull.title)}
              />
              <RepositoryListCard
                title="Workflow Runs"
                items={(workflowRuns ?? []).map(
                  (run) => `${run.name ?? "Workflow"} · ${run.status ?? "—"}`,
                )}
              />
            </div>
          )}
        </Card>
      )}

      {workspaceEnabled && canReadWorkspace && (
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Web APP Workspace Yönetimi</h2>
              <p className="text-sm text-[#A0A0A0]">Section/Item, revizyon, haftalık rapor ve toplantı karar akışı</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#A0A0A0]">Sekme</label>
              <select
                value={selectedWorkspaceTab}
                onChange={(event) => setSelectedWorkspaceTab(event.target.value as WorkspaceTabKey)}
                className="h-9 rounded-md border border-white/15 bg-[#151515] px-3 text-xs text-white"
              >
                {WORKSPACE_TAB_OPTIONS.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {workspaceFeedback && <p className="mb-3 text-sm text-[#d8ff8f]">{workspaceFeedback}</p>}
          {isFetchingWorkspace && <p className="mb-3 text-xs text-[#A0A0A0]">Workspace verileri güncelleniyor...</p>}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="border-white/[0.06] bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#AAFF01]" />
                <h3 className="text-sm font-semibold">Section / Item Yönetimi</h3>
              </div>
              {canManageWorkspace && (
                <div className="space-y-2 rounded-lg border border-white/10 p-3">
                  <Input
                    placeholder="Section key (örn: ui-prototype)"
                    value={sectionForm.key}
                    onChange={(event) => setSectionForm((prev) => ({ ...prev, key: event.target.value }))}
                  />
                  <Input
                    placeholder="Section başlık"
                    value={sectionForm.title}
                    onChange={(event) => setSectionForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  <Input
                    placeholder="Section açıklama (opsiyonel)"
                    value={sectionForm.description}
                    onChange={(event) => setSectionForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                  <Button onClick={() => void createSection()} disabled={isCreatingWorkspaceSection}>
                    Section Ekle
                  </Button>
                </div>
              )}

              <div className="mt-3 space-y-2">
                {(workspaceSnapshot?.sections ?? []).map((section) => (
                  <div key={section.id} className="rounded-lg border border-white/10 p-3">
                    <p className="text-sm text-white">{section.title}</p>
                    <p className="text-xs text-[#A0A0A0]">{section.key}</p>
                    <p className="mt-1 text-xs text-[#A0A0A0]">Item: {section.items.length}</p>
                  </div>
                ))}
                {(workspaceSnapshot?.sections ?? []).length === 0 && (
                  <p className="text-xs text-[#A0A0A0]">Seçili sekmede section bulunmuyor.</p>
                )}
              </div>

              {canManageWorkspace && (workspaceSnapshot?.sections?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-2 rounded-lg border border-white/10 p-3">
                  <select
                    className="h-9 w-full rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
                    value={itemForm.sectionId}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, sectionId: event.target.value }))}
                  >
                    <option value="">Section seçin</option>
                    {(workspaceSnapshot?.sections ?? []).map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Item başlık"
                    value={itemForm.title}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  <Input
                    placeholder="Item body (opsiyonel)"
                    value={itemForm.body}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, body: event.target.value }))}
                  />
                  <Input
                    placeholder="Item link (opsiyonel)"
                    value={itemForm.href}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, href: event.target.value }))}
                  />
                  <Button onClick={() => void createSectionItem()} disabled={isCreatingWorkspaceItem}>
                    Item Ekle
                  </Button>
                </div>
              )}
            </Card>

            <Card className="border-white/[0.06] bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#AAFF01]" />
                <h3 className="text-sm font-semibold">Sekme Mesajları</h3>
              </div>
              {canInteractWorkspace && (
                <div className="mb-3 space-y-2">
                  <Input
                    placeholder="Mesaj yazın"
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                  />
                  <Button onClick={() => void sendWorkspaceMessage()} disabled={isSendingWorkspaceMessage}>
                    Mesaj Gönder
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {workspaceMessages.slice(0, 8).map((message) => (
                  <div key={message.id} className="rounded-lg border border-white/10 p-3">
                    <p className="text-sm text-white">{message.body}</p>
                    <p className="mt-1 text-xs text-[#A0A0A0]">
                      {message.author?.displayName ?? "Kullanıcı"} • {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                ))}
                {workspaceMessages.length === 0 && (
                  <p className="text-xs text-[#A0A0A0]">Bu sekme için mesaj bulunmuyor.</p>
                )}
              </div>
            </Card>

            <Card className="border-white/[0.06] bg-white/5 p-4">
              <h3 className="mb-3 text-sm font-semibold">Revizyon Geçişleri</h3>
              <div className="space-y-3">
                {workspaceRevisions.slice(0, 8).map((revision) => (
                  <div key={revision.id} className="rounded-lg border border-white/10 p-3">
                    <p className="text-sm text-white">{revision.title}</p>
                    <p className="mt-1 text-xs text-[#A0A0A0]">{revision.status}</p>
                    {canManageWorkspace && (
                      <div className="mt-2 space-y-2">
                        <select
                          className="h-8 w-full rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
                          value={revision.status}
                          onChange={(event) =>
                            void changeRevisionStatus(
                              revision.id,
                              event.target.value as WorkspaceRevisionStatus,
                            )
                          }
                          disabled={isUpdatingRevision}
                        >
                          {REVISION_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <Input
                          placeholder="Transition notu (opsiyonel)"
                          value={revisionNote[revision.id] ?? ""}
                          onChange={(event) =>
                            setRevisionNote((prev) => ({ ...prev, [revision.id]: event.target.value }))
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
                {workspaceRevisions.length === 0 && (
                  <p className="text-xs text-[#A0A0A0]">Revizyon kaydı bulunmuyor.</p>
                )}
              </div>
            </Card>

            <Card className="border-white/[0.06] bg-white/5 p-4">
              <h3 className="mb-3 text-sm font-semibold">Haftalık Raporlar</h3>
              {canManageWorkspace && (
                <div className="mb-3 space-y-2 rounded-lg border border-white/10 p-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input
                      type="date"
                      value={reportForm.weekStartDate}
                      onChange={(event) =>
                        setReportForm((prev) => ({ ...prev, weekStartDate: event.target.value }))
                      }
                    />
                    <Input
                      type="date"
                      value={reportForm.weekEndDate}
                      onChange={(event) =>
                        setReportForm((prev) => ({ ...prev, weekEndDate: event.target.value }))
                      }
                    />
                  </div>
                  <Input
                    placeholder="Özet"
                    value={reportForm.summary}
                    onChange={(event) => setReportForm((prev) => ({ ...prev, summary: event.target.value }))}
                  />
                  <Input
                    placeholder="Bu hafta tamamlananlar"
                    value={reportForm.accomplishments}
                    onChange={(event) =>
                      setReportForm((prev) => ({ ...prev, accomplishments: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Gelecek hafta planı"
                    value={reportForm.plannedNext}
                    onChange={(event) =>
                      setReportForm((prev) => ({ ...prev, plannedNext: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Blokajlar"
                    value={reportForm.blockers}
                    onChange={(event) => setReportForm((prev) => ({ ...prev, blockers: event.target.value }))}
                  />
                  <Button onClick={() => void createWeeklyReport()} disabled={isCreatingReport}>
                    Haftalık Rapor Ekle
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {workspaceReports.slice(0, 6).map((report) => (
                  <div key={report.id} className="rounded-lg border border-white/10 p-3">
                    <p className="text-sm text-white">{report.summary}</p>
                    <p className="mt-1 text-xs text-[#A0A0A0]">
                      {formatDate(report.weekStartDate)} - {formatDate(report.weekEndDate)}
                    </p>
                  </div>
                ))}
                {workspaceReports.length === 0 && (
                  <p className="text-xs text-[#A0A0A0]">Haftalık rapor bulunmuyor.</p>
                )}
              </div>
            </Card>

            <Card className="border-white/[0.06] bg-white/5 p-4 xl:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4 text-[#AAFF01]" />
                <h3 className="text-sm font-semibold">Toplantı Talepleri</h3>
              </div>
              <div className="space-y-3">
                {workspaceMeetings.slice(0, 10).map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border border-white/10 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-white">{meeting.title}</p>
                      <Badge variant="outline">{meeting.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#A0A0A0]">{meeting.agenda ?? "Ajanda belirtilmedi."}</p>
                    <p className="mt-1 text-xs text-[#A0A0A0]">
                      Talep: {formatDateTime(meeting.preferredStartAt)} - {formatDateTime(meeting.preferredEndAt)}
                    </p>
                    {canManageWorkspace && (
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr_auto]">
                        <select
                          className="h-8 rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
                          defaultValue={meeting.status}
                          onChange={(event) =>
                            void decideMeetingRequest(
                              meeting.id,
                              event.target.value as WorkspaceMeetingRequestStatus,
                            )
                          }
                          disabled={isUpdatingMeeting}
                        >
                          {MEETING_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <Input
                          placeholder="Yanıt notu"
                          value={meetingResponseNote[meeting.id] ?? ""}
                          onChange={(event) =>
                            setMeetingResponseNote((prev) => ({ ...prev, [meeting.id]: event.target.value }))
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() => void decideMeetingRequest(meeting.id, meeting.status)}
                          disabled={isUpdatingMeeting}
                        >
                          Notu Kaydet
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {workspaceMeetings.length === 0 && (
                  <p className="text-xs text-[#A0A0A0]">Toplantı talebi bulunmuyor.</p>
                )}
              </div>
            </Card>
          </div>
        </Card>
      )}

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Proje Dosyaları</h2>
            <p className="text-sm text-[#A0A0A0]">Klasör oluşturma ve dosya klasörleme</p>
          </div>
          {isFetchingFiles && <span className="text-xs text-[#d2ff8a]">Dosyalar güncelleniyor...</span>}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Yeni klasör adı"
          />
          <Button
            className="gap-2"
            onClick={() => void createFolder()}
            disabled={isCreatingFolder || folderName.trim().length === 0}
          >
            <FolderPlus className="h-4 w-4" />
            Klasör Oluştur
          </Button>
        </div>
        {filesFeedback && <p className="mt-3 text-sm text-[#d8ff8f]">{filesFeedback}</p>}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-white/[0.06] bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold">Klasörler</h3>
            {folders.length === 0 ? (
              <p className="text-sm text-[#A0A0A0]">Henüz klasör yok.</p>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-[#EAEAEA]"
                  >
                    {folder.name}
                  </div>
                ))}
              </div>
            )}

            {canManageRepository && folders.length > 0 && (
              <div className="mt-4 rounded-lg border border-white/10 p-3">
                <p className="mb-2 text-xs text-[#A0A0A0]">Klasör Çalışan Atamaları</p>
                <select
                  value={activeFolderId}
                  onChange={(event) => setSelectedFolderForAssignment(event.target.value)}
                  className="mb-3 h-8 w-full rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
                >
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <div className="space-y-2">
                  {folderAssignees.map((assignee) => (
                    <label key={assignee.id} className="flex items-center gap-2 text-xs text-[#D8D8D8]">
                      <input
                        type="checkbox"
                        checked={assignee.isAssigned}
                        onChange={async (event) => {
                          const nextUserIds = event.target.checked
                            ? [...folderAssignees.filter((item) => item.isAssigned).map((item) => item.id), assignee.id]
                            : folderAssignees
                                .filter((item) => item.isAssigned && item.id !== assignee.id)
                                .map((item) => item.id);
                          try {
                            setFilesFeedback(null);
                            await updateProjectFileFolderAssignees({
                              projectId: project.id,
                              folderId: activeFolderId,
                              userIds: Array.from(new Set(nextUserIds)),
                            }).unwrap();
                            setFilesFeedback("Klasör atamaları güncellendi.");
                          } catch (error) {
                            setFilesFeedback(extractApiErrorMessage(error, "Klasör atamaları güncellenemedi."));
                          }
                        }}
                      />
                      <span>
                        {assignee.displayName ?? assignee.email} ({assignee.role})
                      </span>
                    </label>
                  ))}
                  {folderAssignees.length === 0 && (
                    <p className="text-xs text-[#A0A0A0]">
                      Bu proje için atama yapılabilecek çalışan bulunamadı.
                    </p>
                  )}
                </div>
                {isSavingFolderAssignees && <p className="mt-2 text-xs text-[#A0A0A0]">Kaydediliyor...</p>}
              </div>
            )}
          </Card>

          <Card className="border-white/[0.06] bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold">Dosyalar ({files.length})</h3>
            {files.length === 0 ? (
              <p className="text-sm text-[#A0A0A0]">Henüz dosya yok.</p>
            ) : (
              <div className="space-y-2">
                {files.slice(0, 15).map((file) => (
                  <div
                    key={file.id}
                    className="rounded-lg border border-white/10 px-3 py-3"
                  >
                    <p className="truncate text-sm text-white">{file.title}</p>
                    <p className="mt-1 text-xs text-[#A0A0A0]">{file.originalFileName}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={file.folderId ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          void updateProjectFileFolder({
                            projectId: project.id,
                            fileId: file.id,
                            folderId: value.length > 0 ? value : null,
                          });
                        }}
                        className="h-8 rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
                      >
                        <option value="">Klasörsüz</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                      {file.folder?.name && (
                        <Badge variant="outline" className="text-xs">
                          {file.folder.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Card>
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
        <FolderKanban className="h-4 w-4 text-[#AAFF01]" />
        {label}
      </div>
      <p className={`text-sm text-white ${mono ? "break-all font-mono" : "break-words"}`}>{value}</p>
    </Card>
  );
}

function RepositoryListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="border-white/[0.06] bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Veri yok</p>
        ) : (
          items.slice(0, 5).map((item, index) => (
            <p key={`${title}-${index}`} className="text-sm text-[#D8D8D8]">
              {item}
            </p>
          ))
        )}
      </div>
    </Card>
  );
}
