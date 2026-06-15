import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Code2,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  FolderCheck,
  Link as LinkIcon,
  Rocket,
  UploadCloud,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  useCompleteProjectFileUploadMutation,
  useCreateProjectFileFolderMutation,
  useCreateProjectFileUploadSignatureMutation,
  useGetProjectFileFoldersQuery,
  useGetProjectFilesQuery,
  useGetProjectsQuery,
} from "../../features/projects/projectsApi";
import type { Project, ProjectFile, ProjectFileCategory } from "../../features/projects/projectsTypes";
import { extractApiErrorMessage, formatDate } from "../../features/projects/projectsUtils";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useAppSelector } from "../../store/hooks";

type DeliveryMode = "FILE" | "LINK";

type DeliveryTypeOption = {
  id: string;
  label: string;
  category: ProjectFileCategory;
  mode: DeliveryMode;
  helper: string;
};

type ClientGroup = {
  clientId: string;
  companyName: string;
  projects: Project[];
};

const defaultDeliveryOptions: DeliveryTypeOption[] = [
  {
    id: "FINAL_FILE",
    label: "Final Dosya",
    category: "DOCUMENT",
    mode: "FILE",
    helper: "Müşteriye teslim edilecek son dosya.",
  },
  {
    id: "FINAL_LINK",
    label: "Final Link",
    category: "DOCUMENT",
    mode: "LINK",
    helper: "Canlı link, Figma linki veya paylaşıma açık teslim bağlantısı.",
  },
];

const designerDeliveryOptions: DeliveryTypeOption[] = [
  {
    id: "UI_UX_DESIGN",
    label: "UI/UX Tasarımı",
    category: "DOCUMENT",
    mode: "FILE",
    helper: "Final UI/UX PDF, sunum veya tasarım çıktısı.",
  },
  {
    id: "DESIGN_SOURCE",
    label: "Tasarım Kaynak Dosyası",
    category: "BRAND_ASSET",
    mode: "FILE",
    helper: "Figma export, görsel paket veya marka varlığı.",
  },
  {
    id: "FIGMA_LINK",
    label: "Figma / Prototip Linki",
    category: "DOCUMENT",
    mode: "LINK",
    helper: "Müşteriye açılacak Figma, prototip veya sunum linki.",
  },
];

const developerDeliveryOptions: DeliveryTypeOption[] = [
  {
    id: "CODE_ZIP",
    label: "Kod ZIP'i",
    category: "WEB_SOURCE",
    mode: "FILE",
    helper: "Final kaynak kod paketi.",
  },
  {
    id: "BUILD_PACKAGE",
    label: "Yayın Paketi",
    category: "WEB_BUILD",
    mode: "FILE",
    helper: "Yayına alınabilir final dosya çıktısı.",
  },
  {
    id: "LIVE_LINK",
    label: "Canlı Link / Kod Deposu",
    category: "WEB_SOURCE",
    mode: "LINK",
    helper: "Canlı site, kod deposu veya yayın linki.",
  },
];

const managerDeliveryOptions: DeliveryTypeOption[] = [
  ...defaultDeliveryOptions,
  {
    id: "REPORT_DELIVERY",
    label: "Final Rapor",
    category: "DOCUMENT",
    mode: "FILE",
    helper: "Müşteriye kapanış raporu veya teslim dokümanı.",
  },
];

export function TeslimDosyalari() {
  const currentUser = useAppSelector(selectCurrentUser);
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErrorDetail,
  } = useGetProjectsQuery();
  const projects = projectsResponse?.data ?? [];
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ensureFeedback, setEnsureFeedback] = useState<string | null>(null);
  const ensuredProjectIdsRef = useRef<Set<string>>(new Set());

  const clientGroups = useMemo<ClientGroup[]>(() => {
    const groups = new Map<string, ClientGroup>();
    for (const project of projects) {
      if (!project.clientProfile) {
        continue;
      }
      const clientId = project.clientProfile.id;
      const group = groups.get(clientId) ?? {
        clientId,
        companyName: project.clientProfile.companyName,
        projects: [],
      };
      group.projects.push(project);
      groups.set(clientId, group);
    }
    return [...groups.values()].sort((left, right) => left.companyName.localeCompare(right.companyName, "tr"));
  }, [projects]);

  const selectedClient = clientGroups.find((group) => group.clientId === selectedClientId) ?? null;
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const deliveryOptions = useMemo(() => getDeliveryOptionsForRole(currentUser?.role), [currentUser?.role]);
  const selectedDeliveryType = deliveryOptions.find((option) => option.id === deliveryTypeId) ?? deliveryOptions[0];
  const finalFolderName = selectedProject ? buildFinalFolderName(selectedProject) : "";

  const { data: folders = [], isFetching: foldersFetching } = useGetProjectFileFoldersQuery(
    { projectId: selectedProjectId },
    { skip: !selectedProjectId },
  );
  const finalFolder = folders.find((folder) => folder.name.toLowerCase() === finalFolderName.toLowerCase()) ?? null;
  const {
    data: filesResponse,
    isLoading: filesLoading,
    isError: filesError,
    error: filesErrorDetail,
    refetch: refetchFiles,
  } = useGetProjectFilesQuery(
    { projectId: selectedProjectId, folderId: finalFolder?.id, limit: 100 },
    { skip: !selectedProjectId || !finalFolder?.id },
  );
  const files = filesResponse?.data ?? [];

  const [createFolder, { isLoading: isCreatingFolder }] = useCreateProjectFileFolderMutation();
  const [createSignature, { isLoading: isSigning }] = useCreateProjectFileUploadSignatureMutation();
  const [completeUpload, { isLoading: isCompleting }] = useCompleteProjectFileUploadMutation();
  const isMutating = isCreatingFolder || isSigning || isCompleting;

  useEffect(() => {
    if (deliveryOptions.length > 0 && !deliveryOptions.some((option) => option.id === deliveryTypeId)) {
      setDeliveryTypeId(deliveryOptions[0].id);
    }
  }, [deliveryOptions, deliveryTypeId]);

  useEffect(() => {
    if (!selectedClient && clientGroups.length > 0) {
      setSelectedClientId(clientGroups[0].clientId);
    }
  }, [clientGroups, selectedClient]);

  useEffect(() => {
    if (!selectedClient) {
      setSelectedProjectId("");
      return;
    }
    if (!selectedClient.projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(selectedClient.projects[0]?.id ?? "");
    }
  }, [selectedClient, selectedProjectId]);

  useEffect(() => {
    if (projects.length === 0 || projectsLoading) {
      return;
    }

    const missingProjects = projects.filter((project) => !ensuredProjectIdsRef.current.has(project.id));
    if (missingProjects.length === 0) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        for (const project of missingProjects) {
          ensuredProjectIdsRef.current.add(project.id);
          await createFolder({
            projectId: project.id,
            name: buildFinalFolderName(project),
          }).unwrap();
        }
        if (!cancelled) {
          setEnsureFeedback("Mevcut firmalar için final teslim klasörleri hazırlandı.");
        }
      } catch (error) {
        if (!cancelled) {
          setEnsureFeedback(extractApiErrorMessage(error, "Final teslim klasörleri hazırlanamadı."));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [createFolder, projects, projectsLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProject || !finalFolder) {
      setFeedback("Önce firma ve proje için final klasörü hazırlanmalı.");
      return;
    }
    if (!title.trim()) {
      setFeedback("Teslim başlığı zorunlu.");
      return;
    }

    try {
      setFeedback(null);
      const composedDescription = buildDeliveryDescription(selectedDeliveryType.label, description);

      if (selectedDeliveryType.mode === "LINK") {
        const normalizedLink = externalLink.trim();
        if (!isValidUrl(normalizedLink)) {
          setFeedback("Geçerli bir teslim linki girin.");
          return;
        }

        await completeUpload({
          projectId: selectedProject.id,
          originalFileName: `${title.trim()}.url`,
          title: title.trim(),
          description: composedDescription,
          publicId: `external-link/${selectedProject.id}/${createLocalId()}`,
          secureUrl: normalizedLink,
          resourceType: "url",
          format: "url",
          bytes: 1,
          mimeType: "text/uri-list",
          category: selectedDeliveryType.category,
          visibility: "CLIENT_VISIBLE",
          folderId: finalFolder.id,
        }).unwrap();
      } else {
        if (!selectedFile) {
          setFeedback("Yüklenecek final dosyasını seçin.");
          return;
        }

        const signature = await createSignature({
          projectId: selectedProject.id,
          fileName: selectedFile.name,
          title: title.trim(),
          description: composedDescription,
          mimeType: selectedFile.type || "application/octet-stream",
          bytes: selectedFile.size,
          category: selectedDeliveryType.category,
          visibility: "CLIENT_VISIBLE",
          folderId: finalFolder.id,
        }).unwrap();

        const formData = new FormData();
        formData.set("file", selectedFile);
        formData.set("api_key", signature.apiKey);
        formData.set("timestamp", String(signature.timestamp));
        formData.set("signature", signature.signature);
        formData.set("public_id", signature.publicId);
        if (signature.assetFolder) {
          formData.set("asset_folder", signature.assetFolder);
        }

        const uploadResponse = await fetch(signature.uploadUrl, {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error(await readCloudinaryError(uploadResponse));
        }

        const uploadJson = (await uploadResponse.json()) as {
          secure_url: string;
          resource_type?: string;
          format?: string;
          bytes?: number;
        };

        await completeUpload({
          projectId: selectedProject.id,
          originalFileName: selectedFile.name,
          title: title.trim(),
          description: composedDescription,
          publicId: signature.publicId,
          secureUrl: uploadJson.secure_url,
          resourceType: uploadJson.resource_type ?? "raw",
          format: uploadJson.format ?? null,
          bytes: uploadJson.bytes ?? selectedFile.size,
          mimeType: selectedFile.type || "application/octet-stream",
          category: selectedDeliveryType.category,
          visibility: "CLIENT_VISIBLE",
          folderId: finalFolder.id,
        }).unwrap();
      }

      setFeedback("Final teslim kaydedildi.");
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setExternalLink("");
      await refetchFiles();
    } catch (error) {
      setFeedback(extractApiErrorMessage(error, "Final teslim kaydedilemedi."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Teslim Dosyaları</h1>
          <p className="text-[#A0A0A0]">
            Müşteriye verilecek final dosya ve linklerin canlı teslim alanı.
          </p>
        </div>
        <Badge className="bg-[#AAFF01] text-[#131313]">Final teslim</Badge>
      </div>

      {projectsError ? (
        <Card className="border-red-500/30 bg-red-500/10 p-5 text-red-200">
          {extractApiErrorMessage(projectsErrorDetail, "Projeler alınamadı.")}
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label>Firma</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={projectsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Firma seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientGroups.map((group) => (
                      <SelectItem key={group.clientId} value={group.clientId}>
                        {group.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Proje</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!selectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Proje seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedClient?.projects ?? []).map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#202020] p-3 text-sm text-[#D8D8D8]">
              <div className="mb-2 flex items-center gap-2">
                <FolderCheck className="h-4 w-4 text-[#AAFF01]" />
                <span className="font-medium text-white">Final klasörü</span>
              </div>
              <p className="break-words text-xs text-[#A0A0A0]">
                {selectedProject
                  ? foldersFetching
                    ? "Klasör kontrol ediliyor..."
                    : finalFolder
                      ? finalFolder.name
                      : `${finalFolderName} hazırlanıyor`
                  : "Firma ve proje seçilmedi."}
              </p>
              {ensureFeedback ? <p className="mt-2 text-xs text-[#d8ff8f]">{ensureFeedback}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Teslim türü</Label>
              <Select value={selectedDeliveryType.id} onValueChange={setDeliveryTypeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deliveryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#A0A0A0]">{selectedDeliveryType.helper}</p>
            </div>

            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn. Final UI tasarım paketi" />
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Opsiyonel kısa açıklama"
              />
            </div>

            {selectedDeliveryType.mode === "LINK" ? (
              <div className="space-y-2">
                <Label>Teslim linki</Label>
                <Input
                  value={externalLink}
                  onChange={(event) => setExternalLink(event.target.value)}
                  placeholder="https://..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Final dosya</Label>
                <Input
                  type="file"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setSelectedFile(nextFile);
                    if (nextFile && !title.trim()) {
                      setTitle(nextFile.name.replace(/\.[^.]+$/, ""));
                    }
                  }}
                />
                {selectedFile ? (
                  <p className="text-xs text-[#A0A0A0]">{selectedFile.name} · {formatFileSize(selectedFile.size)}</p>
                ) : null}
              </div>
            )}

            {feedback ? <p className="text-sm text-[#d8ff8f]">{feedback}</p> : null}

            <Button
              type="submit"
              className="w-full gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
              disabled={isMutating || !selectedProject || !finalFolder}
            >
              <UploadCloud className="h-4 w-4" />
              Final Teslim Ekle
            </Button>
          </form>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Firma Final Teslimleri</h2>
              <p className="text-sm text-[#A0A0A0]">
                {selectedProject ? selectedProject.name : "Firma ve proje seçin."}
              </p>
            </div>
            <Badge variant="outline" className="border-white/[0.12] text-[#A0A0A0]">
              {files.length} kayıt
            </Badge>
          </div>

          {!selectedProject ? (
            <StateCard>Final teslimleri görmek için firma seçin.</StateCard>
          ) : null}
          {selectedProject && filesLoading ? <StateCard>Final teslimler yükleniyor...</StateCard> : null}
          {selectedProject && filesError && !filesLoading ? (
            <Card className="border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
              {extractApiErrorMessage(filesErrorDetail, "Final teslimler alınamadı.")}
            </Card>
          ) : null}
          {selectedProject && !filesLoading && !filesError && files.length === 0 ? (
            <StateCard>Bu firma/proje için henüz final teslim bulunmuyor.</StateCard>
          ) : null}

          <div className="space-y-3">
            {files.map((file) => (
              <FinalFileRow key={file.id} file={file} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FinalFileRow({ file }: { file: ProjectFile }) {
  const Icon = getFileIcon(file);
  const isLink = file.resourceType === "url" || file.mimeType === "text/uri-list";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#202020] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#AAFF01]/10">
            <Icon className="h-5 w-5 text-[#AAFF01]" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{file.title}</h3>
            <p className="mt-1 text-xs text-[#A0A0A0]">
              {file.originalFileName} · {formatFileSize(file.bytes)} · {formatDate(file.createdAt)}
            </p>
            {file.description ? (
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#D8D8D8]">{file.description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Badge variant="outline" className="hidden border-white/[0.12] text-xs text-[#A0A0A0] sm:inline-flex">
            {isLink ? "Link" : "Dosya"}
          </Badge>
          <Button size="sm" variant="ghost" asChild>
            <a href={file.secureUrl} target="_blank" rel="noreferrer" title={isLink ? "Linki aç" : "Dosyayı aç"}>
              {isLink ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StateCard({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.12] bg-[#202020] p-6 text-center text-sm text-[#A0A0A0]">
      {children}
    </div>
  );
}

function getDeliveryOptionsForRole(role: string | undefined): DeliveryTypeOption[] {
  if (role === "DESIGNER") return designerDeliveryOptions;
  if (role === "DEVELOPER") return developerDeliveryOptions;
  if (role === "PROJECT_MANAGER" || role === "ADMIN") return managerDeliveryOptions;
  return defaultDeliveryOptions;
}

function buildFinalFolderName(project: Project): string {
  const companyName = project.clientProfile?.companyName ?? project.name;
  return `FINAL-${companyName} - Teslim Dosyaları`;
}

function buildDeliveryDescription(deliveryType: string, description: string): string {
  const lines = [`Teslim türü: ${deliveryType}`];
  if (description.trim()) {
    lines.push(description.trim());
  }
  return lines.join("\n");
}

function getFileIcon(file: ProjectFile): LucideIcon {
  const mime = file.mimeType.toLowerCase();
  const name = file.originalFileName.toLowerCase();
  if (file.resourceType === "url" || mime === "text/uri-list") return LinkIcon;
  if (mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/.test(name)) return FileImage;
  if (mime.includes("zip") || /\.(zip|rar|7z|gz)$/.test(name)) return Archive;
  if (/\.(html?|css|js|ts|tsx|json)$/.test(name)) return Code2;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 1) {
    return "Link";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createLocalId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function readCloudinaryError(response: Response): Promise<string> {
  try {
    const errorJson = (await response.json()) as { error?: { message?: string } };
    return errorJson.error?.message ? `Cloudinary yüklemesi başarısız: ${errorJson.error.message}` : "Cloudinary yüklemesi başarısız.";
  } catch {
    return "Cloudinary yüklemesi başarısız.";
  }
}
