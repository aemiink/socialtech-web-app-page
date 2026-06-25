import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, MessageSquare, Send } from "lucide-react";
import { Button } from "../components/button";
import { useGetClientProjectsQuery } from "../features/projects/projectsApi";
import {
  useAddOwnTicketMessageMutation,
  useCreateOwnTicketMutation,
  useGetOwnTicketsQuery,
} from "../features/tickets/ticketsApi";
import type { ClientTicket, ClientTicketPriority, ClientTicketStatus } from "../features/tickets/ticketsTypes";
import type { ServiceId } from "../data/service-pages";

const PRIORITY_OPTIONS: ClientTicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

type TicketsPageProps = {
  projectId?: string | null;
  selectedService?: ServiceId | null;
};

export function TicketsPage({ projectId, selectedService }: TicketsPageProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ClientTicketPriority>("MEDIUM");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const { data: tickets = [], isLoading, isError } = useGetOwnTicketsQuery();
  const { data: projects = [] } = useGetClientProjectsQuery();
  const [createTicket, { isLoading: isCreating }] = useCreateOwnTicketMutation();
  const [addTicketMessage, { isLoading: isReplying }] = useAddOwnTicketMessageMutation();

  const scopedProjectOptions = useMemo(() => {
    if (!selectedService) {
      return projects;
    }
    return projects.filter((project) => normalizeServiceKey(project.serviceKey) === selectedService);
  }, [projects, selectedService]);

  const visibleTickets = useMemo(() => {
    if (!selectedService) {
      return tickets;
    }
    return tickets.filter((ticket) => {
      if (ticket.projectId && scopedProjectOptions.some((project) => project.id === ticket.projectId)) {
        return true;
      }
      if (ticket.serviceKey && normalizeServiceKey(ticket.serviceKey) === selectedService) {
        return true;
      }
      return !ticket.projectId && !ticket.serviceKey;
    });
  }, [scopedProjectOptions, selectedService, tickets]);

  async function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 3 || description.trim().length < 3) {
      return;
    }

    try {
      setFeedback(null);
      await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        projectId: selectedProjectId || projectId || null,
        serviceKey: selectedService ?? null,
      }).unwrap();
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setFeedback("Talebiniz ekibe iletildi.");
    } catch {
      setFeedback("Talep oluşturulamadı. Lütfen tekrar deneyin.");
    }
  }

  async function handleReply(ticketId: string) {
    const draft = replyDrafts[ticketId]?.trim() ?? "";
    if (!draft) {
      return;
    }

    try {
      setFeedback(null);
      await addTicketMessage({ ticketId, body: draft }).unwrap();
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      setFeedback("Yanıtınız gönderildi.");
    } catch {
      setFeedback("Yanıt gönderilemedi. Lütfen tekrar deneyin.");
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Talepler</h1>
        <p className="mt-2 text-sm text-[#A0A0A0]">Destek, soru ve takip taleplerinizi ekiple buradan paylaşın.</p>
      </div>

      <form className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5" onSubmit={handleCreateTicket}>
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#AAFF01]" />
          <h2 className="text-lg font-medium text-white">Yeni Talep Aç</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Talep başlığı"
            className="h-11 rounded-xl border border-white/[0.12] bg-[#202020] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/50"
            required
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as ClientTicketPriority)}
            className="h-11 rounded-xl border border-white/[0.12] bg-[#202020] px-3 text-sm text-white outline-none"
          >
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {getPriorityLabel(item)}
              </option>
            ))}
          </select>
          <select
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="h-11 rounded-xl border border-white/[0.12] bg-[#202020] px-3 text-sm text-white outline-none"
          >
            <option value="">Genel talep</option>
            {scopedProjectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Talebinizi detaylandırın"
            className="rounded-xl border border-white/[0.12] bg-[#202020] p-3 text-sm text-white outline-none focus:border-[#AAFF01]/50 lg:col-span-3"
            required
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="submit" icon={Send} disabled={isCreating}>
            {isCreating ? "Gönderiliyor..." : "Talebi Gönder"}
          </Button>
          {feedback ? <span className="text-sm text-[#AAFF01]">{feedback}</span> : null}
        </div>
      </form>

      <div className="space-y-3">
        {isLoading ? <StateCard text="Talepler yükleniyor..." /> : null}
        {isError ? <StateCard text="Talepler alınamadı." tone="error" /> : null}
        {!isLoading && !isError && visibleTickets.length === 0 ? (
          <StateCard text="Henüz açık talebiniz bulunmuyor." />
        ) : null}
        {visibleTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            replyDraft={replyDrafts[ticket.id] ?? ""}
            isReplying={isReplying}
            onReplyChange={(value) => setReplyDrafts((prev) => ({ ...prev, [ticket.id]: value }))}
            onReply={() => void handleReply(ticket.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  replyDraft,
  isReplying,
  onReplyChange,
  onReply,
}: {
  ticket: ClientTicket;
  replyDraft: string;
  isReplying: boolean;
  onReplyChange: (value: string) => void;
  onReply: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-white">{ticket.title}</h3>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            {ticket.project?.name ?? "Genel talep"} · {new Date(ticket.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClass(ticket.status)}`}>
            {getStatusLabel(ticket.status)}
          </span>
          <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-xs text-[#D8D8D8]">
            {getPriorityLabel(ticket.priority)}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#D8D8D8]">{ticket.description}</p>

      <div className="mt-4 space-y-2">
        {ticket.messages.map((message) => (
          <div key={message.id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <p className="text-xs text-[#A0A0A0]">
              {message.author?.displayName ?? "Social Tech"} · {new Date(message.createdAt).toLocaleString("tr-TR")}
            </p>
            <p className="mt-2 text-sm leading-6 text-white">{message.body}</p>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={replyDraft}
            onChange={(event) => onReplyChange(event.target.value)}
            rows={3}
            placeholder="Ek bilgi veya yanıt yazın"
            className="w-full rounded-xl border border-white/[0.12] bg-[#202020] p-3 text-sm text-white outline-none focus:border-[#AAFF01]/50"
          />
          <Button
            variant="secondary"
            icon={Send}
            disabled={isReplying || replyDraft.trim().length === 0}
            onClick={onReply}
          >
            {isReplying ? "Gönderiliyor..." : "Yanıt Gönder"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function StateCard({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <div className={`rounded-2xl border p-5 text-sm ${
      tone === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-200"
        : "border-white/[0.08] bg-[#1A1A1A] text-[#A0A0A0]"
    }`}>
      {tone === "error" ? <AlertCircle className="mr-2 inline h-4 w-4" /> : null}
      {text}
    </div>
  );
}

function getStatusLabel(status: ClientTicketStatus): string {
  const labels: Record<ClientTicketStatus, string> = {
    OPEN: "Açık",
    IN_PROGRESS: "İşlemde",
    WAITING_CLIENT: "Yanıt Bekleniyor",
    RESOLVED: "Çözüldü",
    CLOSED: "Kapandı",
  };
  return labels[status];
}

function getStatusClass(status: ClientTicketStatus): string {
  if (status === "OPEN") return "border-[#FFA726]/30 bg-[#FFA726]/10 text-[#FFA726]";
  if (status === "IN_PROGRESS") return "border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#9CEEFF]";
  if (status === "WAITING_CLIENT") return "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#AAFF01]";
  if (status === "RESOLVED") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

function getPriorityLabel(priority: ClientTicketPriority): string {
  const labels: Record<ClientTicketPriority, string> = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
    URGENT: "Acil",
  };
  return labels[priority];
}

function normalizeServiceKey(value?: string | null): string {
  return (value ?? "").toLowerCase().replace(/_/g, "-").trim();
}
