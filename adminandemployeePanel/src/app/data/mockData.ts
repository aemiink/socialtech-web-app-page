// Centralized realistic data for Social Tech Agency

export const clients = [
  {
    id: "1",
    name: "Koçtaş",
    industry: "Perakende",
    monthlyValue: 85000,
    contractStart: "2024-01-15",
    contractEnd: "2026-01-15",
    status: "active",
    paymentStatus: "paid",
    services: ["Meta ADS", "Google ADS", "Social Media", "SEO"],
    contactPerson: "Mehmet Yılmaz",
    email: "mehmet.yilmaz@koctas.com",
    phone: "+90 212 555 0101",
    activeProjects: 4,
    totalSpent: 935000,
    riskLevel: "low"
  },
  {
    id: "2",
    name: "Türk Telekom",
    industry: "Telekomünikasyon",
    monthlyValue: 125000,
    contractStart: "2023-06-01",
    contractEnd: "2025-06-01",
    status: "active",
    paymentStatus: "paid",
    services: ["Web APP", "Meta ADS", "TikTok ADS", "Social Media"],
    contactPerson: "Ayşe Demir",
    email: "ayse.demir@turktelekom.com.tr",
    phone: "+90 212 555 0202",
    activeProjects: 5,
    totalSpent: 2375000,
    riskLevel: "low"
  },
  {
    id: "3",
    name: "Migros",
    industry: "Perakende",
    monthlyValue: 95000,
    contractStart: "2024-03-01",
    contractEnd: "2026-03-01",
    status: "active",
    paymentStatus: "overdue",
    services: ["Meta ADS", "Google ADS", "Landing Pages", "Social Media"],
    contactPerson: "Can Öztürk",
    email: "can.ozturk@migros.com.tr",
    phone: "+90 212 555 0303",
    activeProjects: 6,
    totalSpent: 142500,
    riskLevel: "high"
  },
  {
    id: "4",
    name: "Getir",
    industry: "E-ticaret",
    monthlyValue: 110000,
    contractStart: "2023-09-15",
    contractEnd: "2025-09-15",
    status: "active",
    paymentStatus: "paid",
    services: ["TikTok ADS", "Meta ADS", "Social Media", "Landing Pages"],
    contactPerson: "Zeynep Arslan",
    email: "zeynep.arslan@getir.com",
    phone: "+90 212 555 0404",
    activeProjects: 5,
    totalSpent: 1980000,
    riskLevel: "low"
  },
  {
    id: "5",
    name: "LC Waikiki",
    industry: "Moda & Tekstil",
    monthlyValue: 78000,
    contractStart: "2024-02-01",
    contractEnd: "2026-02-01",
    status: "active",
    paymentStatus: "pending",
    services: ["Meta ADS", "Google ADS", "Social Media"],
    contactPerson: "Burak Kaya",
    email: "burak.kaya@lcw.com",
    phone: "+90 212 555 0505",
    activeProjects: 3,
    totalSpent: 234000,
    riskLevel: "medium"
  },
  {
    id: "6",
    name: "Hepsiburada",
    industry: "E-ticaret",
    monthlyValue: 140000,
    contractStart: "2023-04-01",
    contractEnd: "2025-04-01",
    status: "active",
    paymentStatus: "paid",
    services: ["Meta ADS", "Google ADS", "Amazon ADS", "Web APP", "SEO"],
    contactPerson: "Selin Çelik",
    email: "selin.celik@hepsiburada.com",
    phone: "+90 212 555 0606",
    activeProjects: 7,
    totalSpent: 3640000,
    riskLevel: "low"
  },
  {
    id: "7",
    name: "Boyner",
    industry: "Moda & Tekstil",
    monthlyValue: 68000,
    contractStart: "2024-01-10",
    contractEnd: "2025-07-10",
    status: "active",
    paymentStatus: "paid",
    services: ["Meta ADS", "Social Media", "Landing Pages"],
    contactPerson: "Emre Şahin",
    email: "emre.sahin@boyner.com.tr",
    phone: "+90 212 555 0707",
    activeProjects: 3,
    totalSpent: 272000,
    riskLevel: "low"
  },
  {
    id: "8",
    name: "Teknosa",
    industry: "Elektronik",
    monthlyValue: 92000,
    contractStart: "2023-11-01",
    contractEnd: "2025-11-01",
    status: "active",
    paymentStatus: "paid",
    services: ["Google ADS", "Meta ADS", "Web APP", "Social Media"],
    contactPerson: "Deniz Aydın",
    email: "deniz.aydin@teknosa.com",
    phone: "+90 212 555 0808",
    activeProjects: 4,
    totalSpent: 1564000,
    riskLevel: "low"
  }
];

export const employees = [
  {
    id: "1",
    name: "Ahmet Yıldırım",
    role: "project-manager",
    email: "ahmet.yildirim@socialtech.com",
    phone: "+90 532 111 1111",
    clients: ["Koçtaş", "Migros", "Boyner"],
    activeTasks: 12,
    department: "Proje Yönetimi",
    startDate: "2022-03-15",
    performance: 92
  },
  {
    id: "2",
    name: "Elif Kara",
    role: "performance-specialist",
    email: "elif.kara@socialtech.com",
    phone: "+90 532 222 2222",
    clients: ["Türk Telekom", "Hepsiburada", "Getir"],
    activeTasks: 18,
    department: "Performance Marketing",
    startDate: "2021-06-01",
    performance: 95
  },
  {
    id: "3",
    name: "Mehmet Demir",
    role: "social-media-specialist",
    email: "mehmet.demir@socialtech.com",
    phone: "+90 532 333 3333",
    clients: ["LC Waikiki", "Migros", "Boyner"],
    activeTasks: 24,
    department: "Social Media",
    startDate: "2022-09-10",
    performance: 88
  },
  {
    id: "4",
    name: "Ayşe Özkan",
    role: "designer",
    email: "ayse.ozkan@socialtech.com",
    phone: "+90 532 444 4444",
    clients: ["Koçtaş", "Getir", "Teknosa"],
    activeTasks: 15,
    department: "Tasarım",
    startDate: "2021-11-20",
    performance: 94
  },
  {
    id: "5",
    name: "Can Arslan",
    role: "developer",
    email: "can.arslan@socialtech.com",
    phone: "+90 532 555 5555",
    clients: ["Türk Telekom", "Hepsiburada", "Teknosa"],
    activeTasks: 11,
    department: "Yazılım Geliştirme",
    startDate: "2022-01-05",
    performance: 91
  },
  {
    id: "6",
    name: "Zeynep Şen",
    role: "performance-specialist",
    email: "zeynep.sen@socialtech.com",
    phone: "+90 532 666 6666",
    clients: ["Koçtaş", "LC Waikiki", "Teknosa"],
    activeTasks: 16,
    department: "Performance Marketing",
    startDate: "2023-02-14",
    performance: 89
  },
  {
    id: "7",
    name: "Burak Çetin",
    role: "seo-specialist",
    email: "burak.cetin@socialtech.com",
    phone: "+90 532 777 7777",
    clients: ["Hepsiburada", "Koçtaş", "Migros"],
    activeTasks: 9,
    department: "SEO",
    startDate: "2022-07-01",
    performance: 93
  },
  {
    id: "8",
    name: "Selin Yılmaz",
    role: "support-specialist",
    email: "selin.yilmaz@socialtech.com",
    phone: "+90 532 888 8888",
    clients: ["Türk Telekom", "Getir", "Teknosa"],
    activeTasks: 7,
    department: "Teknik Destek",
    startDate: "2023-04-10",
    performance: 90
  }
];

export const projects = [
  {
    id: "1",
    name: "Koçtaş Bahar Kampanyası",
    client: "Koçtaş",
    service: "Meta ADS",
    status: "in-progress",
    budget: 45000,
    spent: 32000,
    startDate: "2026-04-01",
    endDate: "2026-05-31",
    assignedTo: ["Elif Kara", "Ayşe Özkan"],
    progress: 65,
    priority: "high"
  },
  {
    id: "2",
    name: "Türk Telekom Fiber Lansmanı",
    client: "Türk Telekom",
    service: "Web APP",
    status: "in-progress",
    budget: 180000,
    spent: 125000,
    startDate: "2026-03-15",
    endDate: "2026-06-30",
    assignedTo: ["Can Arslan", "Ahmet Yıldırım"],
    progress: 55,
    priority: "critical"
  },
  {
    id: "3",
    name: "Migros Ramazan Özel",
    client: "Migros",
    service: "Google ADS",
    status: "in-progress",
    budget: 38000,
    spent: 28500,
    startDate: "2026-03-20",
    endDate: "2026-04-30",
    assignedTo: ["Zeynep Şen"],
    progress: 75,
    priority: "high"
  },
  {
    id: "4",
    name: "Getir TikTok Viral Kampanya",
    client: "Getir",
    service: "TikTok ADS",
    status: "in-progress",
    budget: 52000,
    spent: 41000,
    startDate: "2026-04-10",
    endDate: "2026-05-15",
    assignedTo: ["Elif Kara", "Mehmet Demir"],
    progress: 80,
    priority: "normal"
  },
  {
    id: "5",
    name: "LC Waikiki Yaz Koleksiyonu",
    client: "LC Waikiki",
    service: "Social Media",
    status: "planning",
    budget: 28000,
    spent: 0,
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    assignedTo: ["Mehmet Demir", "Ayşe Özkan"],
    progress: 15,
    priority: "normal"
  },
  {
    id: "6",
    name: "Hepsiburada SEO Audit",
    client: "Hepsiburada",
    service: "SEO",
    status: "in-progress",
    budget: 65000,
    spent: 48000,
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    assignedTo: ["Burak Çetin"],
    progress: 70,
    priority: "high"
  },
  {
    id: "7",
    name: "Boyner Landing Page Redesign",
    client: "Boyner",
    service: "Landing Pages",
    status: "completed",
    budget: 22000,
    spent: 21500,
    startDate: "2026-02-15",
    endDate: "2026-04-15",
    assignedTo: ["Ayşe Özkan", "Can Arslan"],
    progress: 100,
    priority: "normal"
  },
  {
    id: "8",
    name: "Teknosa E-ticaret Platformu",
    client: "Teknosa",
    service: "Web APP",
    status: "in-progress",
    budget: 220000,
    spent: 165000,
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    assignedTo: ["Can Arslan", "Selin Yılmaz"],
    progress: 60,
    priority: "critical"
  }
];

export const tasks = [
  {
    id: "1",
    title: "Koçtaş Meta ADS kreatif onayı",
    client: "Koçtaş",
    project: "Koçtaş Bahar Kampanyası",
    assignedTo: "Ayşe Özkan",
    status: "in-progress",
    priority: "high",
    deadline: "2026-04-28",
    description: "5 adet bahar kampanyası kreatif tasarımı"
  },
  {
    id: "2",
    title: "Türk Telekom API entegrasyonu",
    client: "Türk Telekom",
    project: "Türk Telekom Fiber Lansmanı",
    assignedTo: "Can Arslan",
    status: "in-progress",
    priority: "critical",
    deadline: "2026-04-29",
    description: "CRM sistemi API bağlantısı"
  },
  {
    id: "3",
    title: "Migros haftalık rapor hazırlama",
    client: "Migros",
    project: "Migros Ramazan Özel",
    assignedTo: "Zeynep Şen",
    status: "pending",
    priority: "high",
    deadline: "2026-04-28",
    description: "Haftalık performans raporu ve öneriler"
  },
  {
    id: "4",
    title: "Getir TikTok video düzenleme",
    client: "Getir",
    project: "Getir TikTok Viral Kampanya",
    assignedTo: "Mehmet Demir",
    status: "review",
    priority: "normal",
    deadline: "2026-04-30",
    description: "3 adet viral video içeriği"
  },
  {
    id: "5",
    title: "Hepsiburada teknik SEO düzeltmeleri",
    client: "Hepsiburada",
    project: "Hepsiburada SEO Audit",
    assignedTo: "Burak Çetin",
    status: "in-progress",
    priority: "high",
    deadline: "2026-05-05",
    description: "Broken link ve meta tag düzeltmeleri"
  }
];

export const campaigns = [
  {
    id: "1",
    name: "Koçtaş - Bahçe Ürünleri",
    client: "Koçtaş",
    platform: "Meta ADS",
    budget: 15000,
    spent: 12400,
    clicks: 45820,
    impressions: 2340000,
    conversions: 1842,
    roas: 4.8,
    status: "active",
    startDate: "2026-04-01",
    endDate: "2026-04-30"
  },
  {
    id: "2",
    name: "Türk Telekom - Fiber İnternet",
    client: "Türk Telekom",
    platform: "Google ADS",
    budget: 28000,
    spent: 26800,
    clicks: 18920,
    impressions: 1560000,
    conversions: 2156,
    roas: 5.2,
    status: "active",
    startDate: "2026-04-10",
    endDate: "2026-05-10"
  },
  {
    id: "3",
    name: "Migros - Ramazan Kolisi",
    client: "Migros",
    platform: "Meta ADS",
    budget: 12000,
    spent: 11200,
    clicks: 32450,
    impressions: 1890000,
    conversions: 1564,
    roas: 3.2,
    status: "active",
    startDate: "2026-03-25",
    endDate: "2026-04-28"
  },
  {
    id: "4",
    name: "Getir - Hızlı Teslimat",
    client: "Getir",
    platform: "TikTok ADS",
    budget: 18000,
    spent: 16400,
    clicks: 89200,
    impressions: 5420000,
    conversions: 3845,
    roas: 6.4,
    status: "active",
    startDate: "2026-04-15",
    endDate: "2026-05-15"
  },
  {
    id: "5",
    name: "Hepsiburada - Elektronik",
    client: "Hepsiburada",
    platform: "Google ADS",
    budget: 35000,
    spent: 34200,
    clicks: 24680,
    impressions: 1980000,
    conversions: 2890,
    roas: 5.8,
    status: "active",
    startDate: "2026-04-01",
    endDate: "2026-04-30"
  }
];

export const meetings = [
  {
    id: "1",
    title: "Koçtaş Aylık Değerlendirme",
    client: "Koçtaş",
    attendees: ["Mehmet Yılmaz", "Ahmet Yıldırım", "Elif Kara"],
    date: "2026-04-29",
    time: "14:00",
    duration: 60,
    type: "client-meeting",
    status: "scheduled",
    agenda: "Nisan ayı performans değerlendirmesi ve Mayıs planlaması"
  },
  {
    id: "2",
    title: "Türk Telekom Sprint Review",
    client: "Türk Telekom",
    attendees: ["Ayşe Demir", "Can Arslan", "Ahmet Yıldırım"],
    date: "2026-04-30",
    time: "11:00",
    duration: 90,
    type: "sprint-review",
    status: "scheduled",
    agenda: "Sprint 8 tamamlanan görevler ve Sprint 9 planlaması"
  },
  {
    id: "3",
    title: "Hepsiburada SEO Rapor Sunumu",
    client: "Hepsiburada",
    attendees: ["Selin Çelik", "Burak Çetin", "Ahmet Yıldırım"],
    date: "2026-05-02",
    time: "10:00",
    duration: 45,
    type: "presentation",
    status: "scheduled",
    agenda: "SEO Audit sonuçları ve aksiyon planı"
  },
  {
    id: "4",
    title: "Getir Kreatif Brief",
    client: "Getir",
    attendees: ["Zeynep Arslan", "Mehmet Demir", "Ayşe Özkan"],
    date: "2026-04-28",
    time: "15:30",
    duration: 60,
    type: "brief",
    status: "scheduled",
    agenda: "Mayıs kampanyası için kreatif brief ve beklentiler"
  }
];

export const approvals = [
  {
    id: "1",
    type: "İçerik",
    client: "Koçtaş",
    title: "Haftalık sosyal medya içerikleri (12 post)",
    submittedBy: "Mehmet Demir",
    submittedDate: "2026-04-25",
    status: "pending",
    priority: "high",
    deadline: "2026-04-28"
  },
  {
    id: "2",
    type: "Tasarım",
    client: "Getir",
    title: "TikTok video kreatif setleri (5 video)",
    submittedBy: "Ayşe Özkan",
    submittedDate: "2026-04-26",
    status: "pending",
    priority: "normal",
    deadline: "2026-04-30"
  },
  {
    id: "3",
    type: "Rapor",
    client: "Migros",
    title: "Google ADS Nisan performans raporu",
    submittedBy: "Zeynep Şen",
    submittedDate: "2026-04-27",
    status: "approved",
    priority: "normal",
    deadline: "2026-04-28"
  },
  {
    id: "4",
    type: "Kod",
    client: "Türk Telekom",
    title: "API entegrasyon modülü",
    submittedBy: "Can Arslan",
    submittedDate: "2026-04-26",
    status: "pending",
    priority: "critical",
    deadline: "2026-04-29"
  }
];

export const reports = [
  {
    id: "1",
    title: "Koçtaş Nisan 2026 Aylık Rapor",
    client: "Koçtaş",
    type: "monthly",
    period: "Nisan 2026",
    createdBy: "Elif Kara",
    createdDate: "2026-04-26",
    services: ["Meta ADS", "Google ADS", "Social Media"],
    metrics: {
      totalSpent: 85000,
      totalRevenue: 412000,
      roas: 4.8,
      conversions: 5420,
      clicks: 124500
    }
  },
  {
    id: "2",
    title: "Hepsiburada Q1 2026 Performans",
    client: "Hepsiburada",
    type: "quarterly",
    period: "Q1 2026",
    createdBy: "Elif Kara",
    createdDate: "2026-04-15",
    services: ["Meta ADS", "Google ADS", "Amazon ADS"],
    metrics: {
      totalSpent: 420000,
      totalRevenue: 2310000,
      roas: 5.5,
      conversions: 18940,
      clicks: 456800
    }
  },
  {
    id: "3",
    title: "Getir Haftalık TikTok Raporu",
    client: "Getir",
    type: "weekly",
    period: "21-27 Nisan 2026",
    createdBy: "Elif Kara",
    createdDate: "2026-04-27",
    services: ["TikTok ADS"],
    metrics: {
      totalSpent: 18000,
      totalRevenue: 115200,
      roas: 6.4,
      conversions: 3845,
      clicks: 89200
    }
  }
];
