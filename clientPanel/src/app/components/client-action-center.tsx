import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle, Clock, Download, MessageSquare, Trash2, X } from 'lucide-react';
import {
  ClientActionRecord,
  clearClientActions,
  readClientActions,
  subscribeClientActions,
} from '../lib/client-actions';
import { Button } from './button';

export function ClientActionCenter() {
  const [actions, setActions] = useState<ClientActionRecord[]>(() => readClientActions());
  const [toast, setToast] = useState<ClientActionRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return subscribeClientActions((record) => {
      setActions(readClientActions());
      setToast(record);
      window.setTimeout(() => setToast((current) => (current?.id === record.id ? null : current)), 4200);
    });
  }, []);

  const unreadCount = useMemo(() => Math.min(actions.length, 9), [actions.length]);

  const handleClear = () => {
    clearClientActions();
    setActions([]);
  };

  return (
    <>
      {toast && (
        <div className="fixed right-6 bottom-24 z-50 w-[360px] rounded-2xl border border-[#AAFF01]/20 bg-[#1A1A1A]/95 p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm">{toast.title}</p>
              <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">{toast.description}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-[#A0A0A0] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-40 flex items-center gap-3 rounded-2xl border border-[#AAFF01]/20 bg-[#1A1A1A] px-4 py-3 text-white shadow-[0_0_30px_rgba(170,255,1,0.12)] transition-all hover:border-[#AAFF01]/40"
      >
        <div className="relative">
          <Bell className="w-5 h-5 text-[#AAFF01]" />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-[#AAFF01] px-1 text-center text-xs text-black">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-sm">İşlem Merkezi</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <aside
            className="h-full w-full max-w-md border-l border-white/[0.08] bg-[#131313] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl text-white">İşlem Merkezi</h2>
                <p className="text-sm text-[#A0A0A0]">Onay, revizyon, rapor ve dosya işlemleri.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#A0A0A0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actions.length > 0 && (
              <div className="mb-4">
                <Button variant="ghost" icon={Trash2} onClick={handleClear} className="text-xs px-3 py-2">
                  Geçmişi Temizle
                </Button>
              </div>
            )}

            <div className="space-y-3 overflow-y-auto pr-1 max-h-[calc(100vh-150px)]">
              {actions.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 text-center">
                  <MessageSquare className="mx-auto mb-3 w-8 h-8 text-[#AAFF01]" />
                  <p className="text-white">Henüz işlem yok</p>
                  <p className="text-sm text-[#A0A0A0] mt-1">Butonları kullandığınızda kayıtlar burada görünecek.</p>
                </div>
              ) : (
                actions.map((action) => (
                  <div key={action.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center flex-shrink-0">
                        {action.type === 'download' ? (
                          <Download className="w-5 h-5 text-[#AAFF01]" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm">{action.title}</p>
                        <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">{action.description}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#A0A0A0]">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(action.timestamp).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
