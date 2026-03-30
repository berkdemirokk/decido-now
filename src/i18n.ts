import { SupportedLanguage } from './types';

export const LANGUAGE_OPTIONS: Array<{ key: SupportedLanguage; label: string }> = [
  { key: 'tr', label: 'Turkish' },
  { key: 'en', label: 'English' },
  { key: 'de', label: 'German' },
  { key: 'fr', label: 'French' },
  { key: 'es', label: 'Spanish' },
  { key: 'it', label: 'Italian' },
  { key: 'pt', label: 'Portuguese' },
  { key: 'nl', label: 'Dutch' },
  { key: 'pl', label: 'Polish' },
  { key: 'sv', label: 'Swedish' },
  { key: 'da', label: 'Danish' },
  { key: 'no', label: 'Norwegian' },
  { key: 'fi', label: 'Finnish' },
  { key: 'ro', label: 'Romanian' },
  { key: 'cs', label: 'Czech' },
];

interface Copy {
  appName: string;
  heroTitle: string;
  heroBody: string;
  sparkTitle: string;
  decisionTitle: string;
  decisionBody: string;
  pendingTitle: string;
  pendingBody: string;
  historyTitle: string;
  historyEmpty: string;
  dnaTitle: string;
  dnaPreparing: string;
  proTitle: string;
  proBody: string;
  appStoreTitle: string;
  appStoreBody: string;
  noScrollTitle: string;
  noScrollBody: string;
  resultTitle: string;
  resultPlaceholder: string;
  reviewHelp: string;
  save: string;
  confirmChoice: string;
  saveReview: string;
  later: string;
  skip: string;
  useSkip: string;
  getChoices: string;
  waiting: string;
  locked: string;
  limitTitle: string;
  limitBody: string;
  savedDecision: string;
  savedReview: string;
  coachTitle: string;
  coachBody: string;
  smartStartTitle: string;
  smartStartButton: string;
  quickStartsTitle: string;
  proRestore: string;
  proManage: string;
  proActive: string;
  proUnavailable: string;
  proSyncing: string;
  proMonthlyBody: string;
  proYearlyBody: string;
  reviewCta: string;
  onboardingTitle: string;
  onboardingBody: string;
  onboardingPrimary: string;
  onboardingSecondary: string;
  weeklyTitle: string;
  tabs: {
    today: string;
    history: string;
    dna: string;
    pro: string;
  };
  sections: {
    mode: string;
    goal: string;
    friction: string;
    energy: string;
    time: string;
    budget: string;
    category: string;
    status: string;
    score: string;
    language: string;
  };
  stats: {
    remaining: string;
    streak: string;
    completed: string;
    pending: string;
    scored: string;
    today: string;
  };
}

const EN_COPY: Copy = {
  appName: 'Decido',
  heroTitle: 'Make one clear move in 10 seconds.',
  heroBody:
    'Stop overthinking. Choose your goal, blocker, time, and energy, then act on one sharp next step.',
  sparkTitle: 'Daily focus',
  decisionTitle: 'Decision screen',
  decisionBody:
    'Choose your goal, blocker, mode, time, budget, and category. Decido brings back 3 clear actions.',
  pendingTitle: 'Pending result check-ins',
  pendingBody: 'Did you do it, did it help, and what happened after?',
  historyTitle: 'History',
  historyEmpty: 'Your timeline will appear after the first decision.',
  dnaTitle: 'Decision DNA',
  dnaPreparing: 'DNA is still building. Score at least 5 decisions to unlock patterns.',
  proTitle: 'Why Pro exists',
  proBody: 'Pro is for a better system, not just more requests.',
  appStoreTitle: 'App Store note',
  appStoreBody:
    'Core experience is app-native, fast, and built for action first. StoreKit turns on when products are ready.',
  noScrollTitle: 'No scrolling. Just choose.',
  noScrollBody:
    'Pick one of the 3 choices, then start immediately. Leave only if you use your daily skip.',
  resultTitle: 'Decision Outcome Score',
  resultPlaceholder: 'What worked, what blocked you?',
  reviewHelp: 'A quick result check makes Decido smarter for the next round.',
  save: 'Save',
  confirmChoice: "I'll do this",
  saveReview: 'Save result',
  later: 'Later',
  skip: 'Skip',
  useSkip: "Use today's skip",
  getChoices: 'Get 3 clear choices',
  waiting: 'Waiting',
  locked: 'Locked',
  limitTitle: 'Daily limit reached',
  limitBody: 'Your free decision quota is done for today. The Pro screen is ready.',
  savedDecision: 'Saved to your history. Start now while the momentum is fresh.',
  savedReview: 'Outcome saved. Your Decision DNA just got sharper.',
  coachTitle: 'Today signal',
  coachBody: 'Pick the clearest next move, not the perfect one. Small clean wins matter.',
  smartStartTitle: 'Smart start',
  smartStartButton: 'Use this setup',
  quickStartsTitle: 'Quick starts',
  proRestore: 'Restore purchases',
  proManage: 'Manage subscription',
  proActive: 'Pro is active on this device.',
  proUnavailable: 'Purchases will activate in the native iOS or Android build.',
  proSyncing: 'Checking the store and syncing your Pro access...',
  proMonthlyBody: 'Unlock unlimited decisions, deeper DNA cards, and smarter weekly momentum.',
  proYearlyBody: 'Best value for building a full-year decision system with lower churn.',
  reviewCta: 'Rate Decido',
  onboardingTitle: 'Set your default momentum',
  onboardingBody: 'Pick the direction you care about most right now. Decido will shape your first suggestions around it.',
  onboardingPrimary: 'Start with this',
  onboardingSecondary: 'Maybe later',
  weeklyTitle: 'Weekly pulse',
  tabs: {
    today: 'Today',
    history: 'History',
    dna: 'DNA',
    pro: 'Pro',
  },
  sections: {
    mode: 'Mode',
    goal: 'Goal',
    friction: 'Blocker',
    energy: 'Energy',
    time: 'Time',
    budget: 'Budget',
    category: 'Category',
    status: 'Status',
    score: 'Score',
    language: 'Language',
  },
  stats: {
    remaining: 'Remaining',
    streak: 'Streak',
    completed: 'Completed',
    pending: 'Pending',
    scored: 'Scored',
    today: 'Today',
  },
};

const TR_COPY: Copy = {
  appName: 'Decido',
  heroTitle: '10 saniyede tek net hamle yap.',
  heroBody:
    'Fazla dusunmeyi kes. Niyetini, tikanma nedenini, zamanini ve enerjini sec; sonra tek net adima gec.',
  sparkTitle: 'Gunluk odak',
  decisionTitle: 'Karar ekrani',
  decisionBody:
    'Niyet, tikanma, mod, zaman, butce ve kategori sec. Decido sana 3 net secenek getirsin.',
  pendingTitle: 'Bekleyen sonuc girisleri',
  pendingBody: 'Yaptin mi, ise yaradi mi, sonrasinda ne oldu?',
  historyTitle: 'Gecmis',
  historyEmpty: 'Ilk karardan sonra zaman cizgisi burada olusacak.',
  dnaTitle: 'Decision DNA',
  dnaPreparing: 'DNA hala olusuyor. Kaliplar icin en az 5 karar skoru gir.',
  proTitle: 'Pro neden var',
  proBody: 'Pro daha fazla istek degil, daha iyi karar sistemi icin var.',
  appStoreTitle: 'App Store notu',
  appStoreBody:
    'Cekirdek deneyim hizli, uygulama ici ve aksiyon odakli. StoreKit urunleri hazir oldugunda acilir.',
  noScrollTitle: 'Kaydirma yok. Sadece sec.',
  noScrollBody:
    'Uc secenekten birini sec ve hemen basla. Cikmak icin sadece gunluk skip hakkin var.',
  resultTitle: 'Karar Sonucu Skoru',
  resultPlaceholder: 'Ne ise yaradi, ne takildi?',
  reviewHelp: "Kisa sonuc girisi, Decido'nun sonraki onerilerini akillandirir.",
  save: 'Kaydet',
  confirmChoice: 'Bunu yapiyorum',
  saveReview: 'Sonucu kaydet',
  later: 'Sonra',
  skip: 'Pas',
  useSkip: 'Bugunluk pas gec',
  getChoices: '3 net secenek getir',
  waiting: 'Bekliyor',
  locked: 'Kilitli',
  limitTitle: 'Gunluk limit doldu',
  limitBody: 'Bugunluk free karar hakkin bitti. Pro ekrani hazir.',
  savedDecision: 'Karar gecmise eklendi. Momentum sicakken simdi basla.',
  savedReview: 'Sonuc kaydedildi. Decido seni biraz daha iyi tanidi.',
  coachTitle: 'Bugun sinyalin',
  coachBody: 'Mukemmel secim degil, en net sonraki adim onemli. Kucuk temiz kazanclar degerli.',
  smartStartTitle: 'Akilli baslangic',
  smartStartButton: 'Bu kurulumu kullan',
  quickStartsTitle: 'Hizli baslangiclar',
  proRestore: 'Satin alimlari geri yukle',
  proManage: 'Aboneligi yonet',
  proActive: 'Bu cihazda Pro aktif.',
  proUnavailable: 'Satin alma native iOS veya Android build icinde acilir.',
  proSyncing: 'Magaza kontrol ediliyor ve Pro erisimi senkronlaniyor...',
  proMonthlyBody: 'Limitsiz karar, daha derin DNA kartlari ve daha akilli haftalik momentum acilir.',
  proYearlyBody: 'Bir yillik karar sistemi icin en iyi fiyat ve daha dusuk churn hedefi.',
  reviewCta: "Decido'yu puanla",
  onboardingTitle: 'Varsayilan ivmeni sec',
  onboardingBody: 'Su an en cok onemsedigin yone basla. Decido ilk onerilerini buna gore sekillendirsin.',
  onboardingPrimary: 'Bununla basla',
  onboardingSecondary: 'Simdilik gec',
  weeklyTitle: 'Haftalik nabiz',
  tabs: {
    today: 'Bugun',
    history: 'Gecmis',
    dna: 'DNA',
    pro: 'Pro',
  },
  sections: {
    mode: 'Mod',
    goal: 'Niyet',
    friction: 'Tikanma',
    energy: 'Enerji',
    time: 'Zaman',
    budget: 'Butce',
    category: 'Kategori',
    status: 'Durum',
    score: 'Skor',
    language: 'Dil',
  },
  stats: {
    remaining: 'Kalan',
    streak: 'Streak',
    completed: 'Tamamlanan',
    pending: 'Bekleyen',
    scored: 'Skorlanan',
    today: 'Bugun',
  },
};

export function getCopy(language: SupportedLanguage) {
  return language === 'tr' ? TR_COPY : EN_COPY;
}
