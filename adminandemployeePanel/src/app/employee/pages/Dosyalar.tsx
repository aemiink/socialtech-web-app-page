import { DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Download, Share2, Trash2 } from "lucide-react";
import {
  useCompleteProjectFileUploadMutation,
  useCreateProjectFileShareLinkMutation,
  useCreateProjectFileUploadSignatureMutation,
  useDeleteProjectFileMutation,
  useGetProjectFileFoldersQuery,
  useGetProjectFilesQuery,
  useGetProjectFileShareLinksQuery,
  useGetProjectsQuery,
  useRevokeProjectFileShareLinkMutation,
} from "../../features/projects/projectsApi";
import type { ProjectFileCategory, ProjectFileVisibility } from "../../features/projects/projectsTypes";
import { useAppSelector } from "../../store/hooks";
import { hasUserPermission, selectCurrentUser } from "../../features/auth/authSelectors";

const CATEGORIES: ProjectFileCategory[] = [
  "WEB_SOURCE",
  "WEB_BUILD",
  "MOBILE_SOURCE",
  "MOBILE_BUILD",
  "ADS_CREATIVE",
  "REPORT",
  "SEO_REPORT",
  "BRAND_ASSET",
  "DOCUMENT",
  "CONTRACT",
  "OTHER",
];

export function Dosyalar() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canShareFiles = hasUserPermission(currentUser, [
    "projects.files.share.assigned",
    "projects.files.manage.any",
  ]);
  const { data: projectsResponse } = useGetProjectsQuery();
  const projects = projectsResponse?.data ?? [];
  const [projectId, setProjectId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectFileCategory>("DOCUMENT");
  const [visibility, setVisibility] = useState<ProjectFileVisibility>("INTERNAL");
  const [folderId, setFolderId] = useState<string>("");
  const [overwrite, setOverwrite] = useState<"new" | "overwrite">("new");
  const [overwriteFileId, setOverwriteFileId] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeProjectId = projectId;
  const { data: filesResponse, isLoading, refetch } = useGetProjectFilesQuery(
    { projectId: activeProjectId, limit: 50 },
    { skip: !activeProjectId },
  );
  const files = filesResponse?.data ?? [];
  const { data: folders = [] } = useGetProjectFileFoldersQuery(
    { projectId: activeProjectId },
    { skip: !activeProjectId },
  );
  const { data: shareLinks = [], refetch: refetchShareLinks } = useGetProjectFileShareLinksQuery(
    { projectId: activeProjectId },
    { skip: !activeProjectId || !canShareFiles },
  );
  const isReportUpload = category === "REPORT";

  const [createSignature, { isLoading: isSigning }] = useCreateProjectFileUploadSignatureMutation();
  const [completeUpload, { isLoading: isCompleting }] = useCompleteProjectFileUploadMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteProjectFileMutation();
  const [createShareLink, { isLoading: isSharing }] = useCreateProjectFileShareLinkMutation();
  const [revokeShareLink, { isLoading: isRevokingShare }] = useRevokeProjectFileShareLinkMutation();
  const NONE_FOLDER_VALUE = "__NONE__";

  const overwriteCandidates = useMemo(() => files.filter((item) => item.category === category), [files, category]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeProjectId || !file || !title.trim()) {
      setFeedback("Proje, dosya ve başlık zorunlu.");
      return;
    }

    try {
      setFeedback(null);
      const signature = await createSignature({
        projectId: activeProjectId,
        fileName: file.name,
        title: title.trim(),
        description: description.trim() || null,
        mimeType: file.type || "application/octet-stream",
        bytes: file.size,
        category,
        visibility: isReportUpload ? "CLIENT_VISIBLE" : visibility,
        overwrite: overwrite === "overwrite",
        overwriteFileId: overwrite === "overwrite" && overwriteFileId ? overwriteFileId : undefined,
        folderId: isReportUpload ? undefined : folderId || undefined,
      }).unwrap();

      const formData = new FormData();
      formData.set("file", file);
      formData.set("api_key", signature.apiKey);
      formData.set("timestamp", String(signature.timestamp));
      formData.set("signature", signature.signature);
      formData.set("public_id", signature.publicId);
      if (signature.assetFolder) {
        formData.set("asset_folder", signature.assetFolder);
      }
      if (signature.overwrite) {
        formData.set("overwrite", "true");
      }

      const uploadResponse = await fetch(signature.uploadUrl, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        let cloudinaryMessage = "Cloudinary upload failed.";
        try {
          const errorJson = (await uploadResponse.json()) as { error?: { message?: string } };
          if (errorJson.error?.message) {
            cloudinaryMessage = `Cloudinary upload failed: ${errorJson.error.message}`;
          }
        } catch {
          // no-op: keep generic message
        }
        throw new Error(cloudinaryMessage);
      }
      const uploadJson = (await uploadResponse.json()) as {
        secure_url: string;
        resource_type: string;
        format?: string;
        bytes: number;
      };

      await completeUpload({
        projectId: activeProjectId,
        originalFileName: file.name,
        title: title.trim(),
        description: description.trim() || null,
        publicId: signature.publicId,
        secureUrl: uploadJson.secure_url,
        resourceType: uploadJson.resource_type ?? "raw",
        format: uploadJson.format ?? null,
        bytes: uploadJson.bytes ?? file.size,
        mimeType: file.type || "application/octet-stream",
        category,
        visibility: isReportUpload ? "CLIENT_VISIBLE" : visibility,
        overwrite: overwrite === "overwrite",
        overwriteFileId: overwrite === "overwrite" && overwriteFileId ? overwriteFileId : undefined,
        folderId: signature.folderId ?? (isReportUpload ? undefined : folderId || undefined),
      }).unwrap();

      setFeedback("Dosya yüklendi.");
      setFile(null);
      setTitle("");
      setDescription("");
      setOverwriteFileId("");
      setFolderId("");
      await refetch();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      setFeedback(getUploadErrorMessage(error));
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    if (!droppedFile) {
      return;
    }
    setFile(droppedFile);
    if (!title.trim()) {
      setTitle(droppedFile.name);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dosyalar</h1>
        <p className="text-[#A0A0A0]">Proje dosyaları ve dokümanlar</p>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleUpload}>
          <div className="space-y-2">
            <Label>Proje</Label>
            <Select value={activeProjectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Proje seç" /></SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Başlık</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                const nextCategory = value as ProjectFileCategory;
                setCategory(nextCategory);
                if (nextCategory === "REPORT") {
                  setVisibility("CLIENT_VISIBLE");
                  setFolderId("");
                }
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Görünürlük</Label>
            <Select
              value={isReportUpload ? "CLIENT_VISIBLE" : visibility}
              onValueChange={(value) => setVisibility(value as ProjectFileVisibility)}
              disabled={isReportUpload}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNAL">INTERNAL</SelectItem>
                <SelectItem value="CLIENT_VISIBLE">CLIENT_VISIBLE</SelectItem>
              </SelectContent>
            </Select>
            {isReportUpload && (
              <p className="text-xs text-[#A0A0A0]">
                Raporlar müşteri panelinde görünecek şekilde otomatik yayınlanır.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Klasör</Label>
            <Select
              value={folderId || NONE_FOLDER_VALUE}
              onValueChange={(value) => setFolderId(value === NONE_FOLDER_VALUE ? "" : value)}
              disabled={isReportUpload}
            >
              <SelectTrigger><SelectValue placeholder="Klasörsüz" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_FOLDER_VALUE}>
                  {isReportUpload ? "Raporlar klasörü otomatik" : "Klasörsüz"}
                </SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isReportUpload && (
              <p className="text-xs text-[#A0A0A0]">
                Operasyon içinde Raporlar klasörü yoksa sistem yükleme sırasında oluşturur.
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Açıklama</Label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Versiyon Modu</Label>
            <Select value={overwrite} onValueChange={(value) => setOverwrite(value as "new" | "overwrite")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Yeni Versiyon</SelectItem>
                <SelectItem value="overwrite">Overwrite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Overwrite Dosyası</Label>
            <Select value={overwriteFileId} onValueChange={setOverwriteFileId} disabled={overwrite !== "overwrite"}>
              <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
              <SelectContent>
                {overwriteCandidates.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Dosya</Label>
            <div
              className={`rounded-lg border border-dashed p-4 text-sm transition ${
                isDragActive ? "border-[#AAFF01] bg-[#AAFF01]/10" : "border-white/[0.2] bg-white/[0.02]"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="text-[#D8D8D8]">
                Dosyayı buraya sürükleyip bırakın veya
                <button
                  type="button"
                  className="ml-1 text-[#AAFF01] underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  seçmek için tıklayın
                </button>
                .
              </p>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="mt-2 text-xs text-[#A0A0A0]">
                  Seçilen: {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90" disabled={isSigning || isCompleting}>
              Dosya Yükle
            </Button>
            {feedback && <span className="text-sm text-[#A0A0A0]">{feedback}</span>}
          </div>
        </form>
      </Card>

      <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
        <h3 className="text-lg font-semibold mb-4">Dosyalar</h3>
        {!activeProjectId && (
          <p className="mb-4 text-[#A0A0A0]">
            Dosya listesini ve yükleme alanını kullanmak için önce proje seçin.
          </p>
        )}
        {isLoading && <p className="text-[#A0A0A0]">Yükleniyor...</p>}
        {!activeProjectId && !isLoading && <p className="text-[#A0A0A0]">Henüz proje seçilmedi.</p>}
        {activeProjectId && !isLoading && files.length === 0 && <p className="text-[#A0A0A0]">Dosya bulunamadı.</p>}
        <div className="space-y-2">
          {files.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-white/5 border border-white/[0.06]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-[#A0A0A0]">{item.originalFileName} • {Math.round(item.bytes / 1024)} KB • {item.visibility}</p>
                  {item.folder?.name && (
                    <p className="text-xs text-[#AAFF01]">Klasör: {item.folder.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" asChild>
                    <a href={item.secureUrl} target="_blank" rel="noreferrer"><Download className="w-4 h-4" /></a>
                  </Button>
                  {canShareFiles && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSharing}
                      onClick={async () => {
                        const share = await createShareLink({ projectId: activeProjectId, fileId: item.id }).unwrap();
                        await navigator.clipboard.writeText(share.shareUrl);
                        setFeedback("Paylaşım linki kopyalandı.");
                        await refetchShareLinks();
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isDeleting}
                    onClick={async () => {
                      await deleteFile({ projectId: activeProjectId, fileId: item.id }).unwrap();
                      await refetch();
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-300" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {canShareFiles && (
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Paylaşım Linkleri</h3>
          {shareLinks.length === 0 && <p className="text-[#A0A0A0]">Paylaşım linki yok.</p>}
          <div className="space-y-2">
            {shareLinks.map((link) => (
              <div key={link.id} className="p-3 rounded-lg bg-white/5 border border-white/[0.06]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{link.projectFile?.title ?? "Dosya"}</p>
                    <p className="text-xs text-[#A0A0A0]">
                      {link.projectFile?.originalFileName ?? "—"} • Exp: {new Date(link.expiresAt).toLocaleString("tr-TR")} • {link.isRevoked ? "Revoked" : "Aktif"}
                    </p>
                  </div>
                  {!link.isRevoked && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isRevokingShare}
                      onClick={async () => {
                        await revokeShareLink({
                          projectId: activeProjectId,
                          fileId: link.projectFileId,
                          shareId: link.id,
                        }).unwrap();
                        await refetchShareLinks();
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function getUploadErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Dosya yüklenemedi.";
  }

  if (error.message.includes("A folder selection is required for your scope.")) {
    return "Bu kapsamda yükleme yapabilmek için önce size atanmış bir klasör seçmelisiniz.";
  }

  if (error.message.includes("You can upload only to folders assigned to you.")) {
    return "Yalnızca size atanmış klasörlere dosya yükleyebilirsiniz.";
  }

  return error.message;
}
