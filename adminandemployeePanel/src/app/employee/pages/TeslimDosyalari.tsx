import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useGetProjectFilesQuery, useGetProjectsQuery } from "../../features/projects/projectsApi";

export function TeslimDosyalari() {
  const { data: projectsResponse } = useGetProjectsQuery();
  const projects = projectsResponse?.data ?? [];
  const [projectId, setProjectId] = useState("");
  const activeProjectId = projectId;
  const { data, isLoading } = useGetProjectFilesQuery(
    { projectId: activeProjectId, visibility: "CLIENT_VISIBLE", limit: 50 },
    { skip: !activeProjectId },
  );
  const files = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Teslim Dosyaları</h1>
        <p className="text-[#A0A0A0]">Müşteri erişimine açık dosyalar</p>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] p-4">
        <Select value={activeProjectId} onValueChange={setProjectId}>
          <SelectTrigger><SelectValue placeholder="Proje seç" /></SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <div className="space-y-3">
        {isLoading && <Card className="bg-[#1A1A1A] border-white/[0.06] p-4 text-[#A0A0A0]">Yükleniyor...</Card>}
        {!activeProjectId && !isLoading && (
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-4 text-[#A0A0A0]">
            Teslim dosyalarını görmek için önce proje seçin.
          </Card>
        )}
        {activeProjectId && !isLoading && files.length === 0 && (
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-4 text-[#A0A0A0]">Teslim dosyası bulunamadı.</Card>
        )}
        {files.map((item) => (
          <Card key={item.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-[#A0A0A0]">{item.originalFileName} • {item.category}</p>
              </div>
              <a className="text-sm text-[#AAFF01]" href={item.secureUrl} target="_blank" rel="noreferrer">Aç</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
