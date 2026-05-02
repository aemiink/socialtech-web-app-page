export type ClientActionType =
  | 'approve'
  | 'revision'
  | 'comment'
  | 'download'
  | 'report'
  | 'meeting'
  | 'save'
  | 'submit'
  | 'open'
  | 'filter'
  | 'invite'
  | 'create'
  | 'manage'
  | 'generic';

export interface ClientActionRecord {
  id: string;
  type: ClientActionType;
  label: string;
  title: string;
  description: string;
  status: 'completed' | 'queued' | 'opened';
  timestamp: string;
}

const STORAGE_KEY = 'socialtech-client-actions';
const EVENT_NAME = 'socialtech:client-action';

export function inferClientAction(label: string): ClientActionType {
  const text = label.toLocaleLowerCase('tr-TR');

  if (text.includes('onay')) return 'approve';
  if (text.includes('revizyon')) return 'revision';
  if (text.includes('yorum') || text.includes('geri bildirim')) return 'comment';
  if (text.includes('indir') || text.includes('download')) return 'download';
  if (text.includes('rapor') || text.includes('performans')) return 'report';
  if (text.includes('toplantı') || text.includes('katıl')) return 'meeting';
  if (text.includes('kaydet') || text.includes('güncelle')) return 'save';
  if (text.includes('gönder') || text.includes('talebi')) return 'submit';
  if (text.includes('görüntüle') || text.includes('aç') || text.includes('incele') || text.includes('önizle')) return 'open';
  if (text.includes('filtre')) return 'filter';
  if (text.includes('davet')) return 'invite';
  if (text.includes('oluştur')) return 'create';
  if (text.includes('yönet')) return 'manage';

  return 'generic';
}

export function getActionCompletedLabel(type: ClientActionType, label: string) {
  switch (type) {
    case 'approve':
      return 'Onaylandı';
    case 'revision':
      return 'Revizyon Kaydedildi';
    case 'comment':
      return 'Yorum Açıldı';
    case 'download':
      return 'İndirildi';
    case 'report':
      return 'Rapor Açıldı';
    case 'meeting':
      return 'Toplantı Hazır';
    case 'save':
      return 'Kaydedildi';
    case 'submit':
      return 'Gönderildi';
    case 'open':
      return 'Açıldı';
    case 'filter':
      return 'Filtre Aktif';
    case 'invite':
      return 'Davet Gönderildi';
    case 'create':
      return 'Oluşturuldu';
    case 'manage':
      return 'Yönetim Açıldı';
    default:
      return label;
  }
}

export function runClientAction(label: string, explicitType?: ClientActionType) {
  const type = explicitType || inferClientAction(label);
  const record: ClientActionRecord = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    label,
    title: getActionTitle(type),
    description: getActionDescription(type, label),
    status: type === 'open' || type === 'report' || type === 'meeting' ? 'opened' : 'completed',
    timestamp: new Date().toISOString(),
  };

  saveAction(record);
  dispatchAction(record);

  if (type === 'download' || label.toLocaleLowerCase('tr-TR').includes('pdf')) {
    downloadActionFile(record);
  }

  return record;
}

export function readClientActions(): ClientActionRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearClientActions() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function subscribeClientActions(callback: (record: ClientActionRecord) => void) {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    callback((event as CustomEvent<ClientActionRecord>).detail);
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

function saveAction(record: ClientActionRecord) {
  if (typeof window === 'undefined') return;

  const records = readClientActions();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...records].slice(0, 40)));
}

function dispatchAction(record: ClientActionRecord) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: record }));
}

function getActionTitle(type: ClientActionType) {
  switch (type) {
    case 'approve':
      return 'Onay kaydedildi';
    case 'revision':
      return 'Revizyon talebi oluşturuldu';
    case 'comment':
      return 'Yorum alanı açıldı';
    case 'download':
      return 'Dosya indirildi';
    case 'report':
      return 'Rapor görüntülendi';
    case 'meeting':
      return 'Toplantı bağlantısı hazır';
    case 'save':
      return 'Değişiklikler kaydedildi';
    case 'submit':
      return 'Talep Social Tech ekibine iletildi';
    case 'open':
      return 'Detay ekranı açıldı';
    case 'filter':
      return 'Filtre uygulandı';
    case 'invite':
      return 'Kullanıcı daveti gönderildi';
    case 'create':
      return 'Yeni kayıt oluşturuldu';
    case 'manage':
      return 'Yönetim ekranı açıldı';
    default:
      return 'İşlem tamamlandı';
  }
}

function getActionDescription(type: ClientActionType, label: string) {
  switch (type) {
    case 'approve':
      return `"${label}" aksiyonu onaylandı ve ajans iş listesine işlendi.`;
    case 'revision':
      return 'Revizyon talebiniz Social Tech ekibine iletildi; işlem merkezi üzerinden takip edebilirsiniz.';
    case 'comment':
      return 'Yorum/görüş alanı aktif edildi. Notunuz işlem geçmişine bağlanacak.';
    case 'download':
      return 'İlgili müşteri dokümanı yerel dosya olarak oluşturuldu.';
    case 'report':
      return 'Rapor görünümü açıldı ve son görüntüleme işlem geçmişine eklendi.';
    case 'meeting':
      return 'Toplantı linki hazırlandı; takvim notu işlem geçmişine işlendi.';
    case 'save':
      return 'Form değişiklikleri panel içinde kaydedildi.';
    case 'submit':
      return 'Talebiniz ajans operasyon kuyruğuna eklendi.';
    case 'filter':
      return 'Liste görünümü seçili filtreye göre güncellendi.';
    default:
      return `"${label}" işlemi tamamlandı.`;
  }
}

function downloadActionFile(record: ClientActionRecord) {
  if (typeof document === 'undefined') return;

  const body = [
    'Social Tech Client Panel',
    record.title,
    '',
    record.description,
    '',
    `İşlem: ${record.label}`,
    `Tarih: ${new Date(record.timestamp).toLocaleString('tr-TR')}`,
  ].join('\n');

  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `social-tech-${record.type}-${record.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
