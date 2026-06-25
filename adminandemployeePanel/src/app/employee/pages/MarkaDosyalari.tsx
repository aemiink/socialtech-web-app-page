import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  Link as LinkIcon,
  Palette,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  useGetProjectFileFoldersQuery,
  useGetProjectFilesQuery,
  useGetProjectsQuery,
} from "../../features/projects/projectsApi";
import type { Project, ProjectFile, ProjectFileCategory, ProjectFileFolder } from "../../features/projects/projectsTypes";
import {
  extractApiErrorMessage,
  formatDate,
  getProjectServiceLabel,
  getProjectStatusLabel,
} from "../../features/projects/projectsUtils";

const categoryLabel: Record<ProjectFileCategory, string> = {
  BRAND_ASSET: "Marka Varlığı",
  DOCUMENT: "Belge",
  CONTRACT: "Sözleşme",
  WEB_SOURCE: "Web Kaynak Dosyası",
  WEB_BUILD: "Web Yayın Paketi",
  MOBILE_SOURCE: "Mobil Kaynak",
  MOBILE_BUILD: "Mobil Build",
  ADS_CREATIVE: "Reklam Kreatif",
  REPORT: "Rapor",
  SEO_REPORT: "SEO Raporu",
  OTHER: "Diğer",
};

type ClientGroup = {
  clientId: string;
  companyName: string;
  latestUpdate: string | null;
  projects: Project[];
};

type FolderNode = {
  id: string;
  name: string;
  files: ProjectFile[];
};

export function MarkaDosyalari() {
  const {
    data: projectsResponse,
    isLoading,
    isError,
    error,
  } = useGetProjectsQuery();
  const projects = projectsResponse?.data ?? [];
  const [expandedClientIds, setExpandedClientIds] = useState<Set<string>>(new Set());

  const clientGroups = useMemo<ClientGroup[]>(() => {
    const groups = new Map<string, ClientGroup>();

    for (const project of projects) {
      if (!project.clientProfile) {
        continue;
      }

      const clientId = project.clientProfile.id;
      const existing = groups.get(clientId);

      if (!existing) {
        groups.set(clientId, {
          clientId,
          companyName: project.clientProfile.companyName,
          latestUpdate: project.updatedAt,
          projects: [project],
        });
        continue;
      }

      existing.projects.push(project);
      if (project.updatedAt > (existing.latestUpdate ?? "")) {
        existing.latestUpdate = project.updatedAt;
      }
    }

    return [...groups.values()].sort((left, right) => left.companyName.localeCompare(right.companyName, "tr"));
  }, [projects]);

  function toggleClient(clientId: string) {
    setExpandedClientIds((current) => {
      const next = new Set(current);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Marka Dosyaları</h1>
          <p className="text-[#A0A0A0]">
            Müşteri, proje ve Cloudinary klasör yapısına göre dosya ağacı.
          </p>
        </div>
        <Badge variant="outline" className="border-[#AAFF01]/30 text-[#AAFF01]">
          Canlı klasör görünümü
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={Folder} label="Müşteri" value={isLoading ? "—" : String(clientGroups.length)} />
        <MetricCard icon={FolderOpen} label="Proje" value={isLoading ? "—" : String(projects.length)} />
        <MetricCard icon={Palette} label="Kaynak" value="Cloudinary klasörleri" />
      </div>

      {isLoading ? (
        <StateCard>Marka dosyaları yükleniyor...</StateCard>
      ) : null}

      {isError && !isLoading ? (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          {extractApiErrorMessage(error, "Marka dosyaları alınamadı.")}
        </Card>
      ) : null}

      {!isLoading && !isError && clientGroups.length === 0 ? (
        <StateCard>Atama kapsamınızda dosya klasörü olan müşteri bulunamadı.</StateCard>
      ) : null}

      <div className="space-y-4">
        {clientGroups.map((group) => {
          const isOpen = expandedClientIds.has(group.clientId);
          return (
            <Card key={group.clientId} className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.03]"
                onClick={() => toggleClient(group.clientId)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#AAFF01]/10">
                    {isOpen ? (
                      <FolderOpen className="h-5 w-5 text-[#AAFF01]" />
                    ) : (
                      <Folder className="h-5 w-5 text-[#AAFF01]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{group.companyName}</h2>
                    <p className="mt-1 text-xs text-[#A0A0A0]">
                      {group.projects.length} proje
                      {group.latestUpdate ? ` · Son güncelleme ${formatDate(group.latestUpdate)}` : ""}
                    </p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-[#A0A0A0]" />
                ) : (
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-[#A0A0A0]" />
                )}
              </button>

              {isOpen ? (
                <div className="space-y-3 border-t border-white/[0.06] p-4">
                  {group.projects.map((project) => (
                    <ProjectFolderTree key={project.id} project={project} />
                  ))}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ProjectFolderTree({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: folders = [],
    isLoading: foldersLoading,
    isError: foldersError,
  } = useGetProjectFileFoldersQuery({ projectId: project.id }, { skip: !isOpen });
  const {
    data: filesResponse,
    isLoading: filesLoading,
    isError: filesError,
  } = useGetProjectFilesQuery({ projectId: project.id, limit: 100 }, { skip: !isOpen });
  const files = filesResponse?.data ?? [];

  const folderNodes = useMemo(() => buildFolderNodes(folders, files), [files, folders]);
  const isLoading = foldersLoading || filesLoading;
  const hasError = foldersError || filesError;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#202020]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{project.name}</p>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            {getProjectServiceLabel(project)} · {getProjectStatusLabel(project.status)}
          </p>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#A0A0A0]" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#A0A0A0]" />
        )}
      </button>

      {isOpen ? (
        <div className="space-y-3 border-t border-white/[0.06] p-3">
          {isLoading ? <p className="text-sm text-[#A0A0A0]">Klasörler yükleniyor...</p> : null}
          {hasError && !isLoading ? (
            <p className="text-sm text-red-300">Bu projenin dosya klasörleri alınamadı.</p>
          ) : null}
          {!isLoading && !hasError && folderNodes.length === 0 ? (
            <p className="text-sm text-[#A0A0A0]">Bu proje için yüklenen dosya bulunmuyor.</p>
          ) : null}
          {folderNodes.map((folder) => (
            <FolderAccordion key={folder.id} folder={folder} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FolderAccordion({ folder }: { folder: FolderNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition hover:bg-white/[0.03]"
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isOpen ? (
            <FolderOpen className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
          ) : (
            <Folder className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{folder.name}</p>
            <p className="mt-0.5 text-xs text-[#A0A0A0]">Yüklenenler · {folder.files.length} dosya</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#A0A0A0]" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#A0A0A0]" />
        )}
      </button>

      {isOpen ? (
        <div className="space-y-2 border-t border-white/[0.06] p-3">
          <p className="text-xs font-medium text-[#A0A0A0]">Yüklenenler</p>
          {folder.files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FileRow({ file }: { file: ProjectFile }) {
  const Icon = getFileIcon(file);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#1A1A1A] px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
          <Icon className="h-4 w-4 text-[#AAFF01]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{file.title}</p>
          <p className="mt-0.5 truncate text-xs text-[#A0A0A0]">
            {file.originalFileName} · {formatFileSize(file.bytes)}
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <Badge variant="outline" className="hidden border-white/[0.12] text-xs text-[#A0A0A0] sm:inline-flex">
          {categoryLabel[file.category] ?? file.category}
        </Badge>
        <Button size="sm" variant="ghost" asChild>
          <a href={file.secureUrl} target="_blank" rel="noreferrer" title="Dosyayı aç">
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#AAFF01]" />
        <span className="text-sm text-[#A0A0A0]">{label}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function StateCard({ children }: { children: string }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-center text-[#A0A0A0]">
      {children}
    </Card>
  );
}

function buildFolderNodes(folders: ProjectFileFolder[], files: ProjectFile[]): FolderNode[] {
  const folderMap = new Map<string, FolderNode>();

  for (const folder of folders) {
    folderMap.set(folder.id, { id: folder.id, name: folder.name, files: [] });
  }

  for (const file of files) {
    const folderId = file.folder?.id ?? file.folderId ?? "__NO_FOLDER__";
    const fallbackName = file.folder?.name ?? "Klasörsüz";
    const node = folderMap.get(folderId) ?? { id: folderId, name: fallbackName, files: [] };
    node.files.push(file);
    folderMap.set(folderId, node);
  }

  return [...folderMap.values()]
    .filter((folder) => folder.files.length > 0)
    .sort((left, right) => left.name.localeCompare(right.name, "tr"));
}

function getFileIcon(file: ProjectFile): LucideIcon {
  const mime = file.mimeType.toLowerCase();
  const name = file.originalFileName.toLowerCase();

  if (file.resourceType === "url" || mime === "text/uri-list") return LinkIcon;
  if (mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/.test(name)) return FileImage;
  if (mime.includes("pdf") || /\.(pdf|docx?|pptx?|xlsx?)$/.test(name)) return FileText;
  if (mime.includes("zip") || /\.(zip|rar|7z|gz)$/.test(name)) return Archive;
  if (/\.(html?|css|js|ts|tsx|json|zip)$/.test(name)) return Code2;

  return FileText;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Boyut yok";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
