import { SupportedLanguage, SystemId } from '../types';

export interface UiCopy {
  tabs: {
    today: string;
    systems: string;
    progress: string;
    settings: string;
  };
  onboarding: {
    title: string;
    body: string;
    goal: string;
    blocker: string;
    time: string;
    energy: string;
    reveal: string;
    revealBody: string;
    continue: string;
    start: string;
    why: string;
  };
  today: {
    eyebrow: string;
    title: string;
    todayGain: string;
    tomorrowGain: string;
    tonight: string;
    start: string;
    why: string;
    swap: string;
    refine: string;
    share: string;
    noMove: string;
    buildMove: string;
  };
  guidance: {
    title: string;
    whyFits: string;
    howToStart: string;
    todayGain: string;
    tomorrowGain: string;
    projection: string;
    lockedProjection: string;
    start: string;
    close: string;
  };
  focusRun: {
    title: string;
    start: string;
    makeEasier: string;
    pause: string;
    resume: string;
    next: string;
    finish: string;
    leave: string;
    leaveTitle: string;
    easyVersion: string;
    leaveAnyway: string;
    halfway: string;
    nearFinish: string;
    completed: string;
    completedBody: string;
    scorePrompt: string;
  };
  progress: {
    title: string;
    momentum: string;
    wins: string;
    pattern: string;
    pending: string;
    recent: string;
    empty: string;
    goToday: string;
    shareWin: string;
  };
  settings: {
    title: string;
    upgrade: string;
    restore: string;
    language: string;
    gift: string;
    widgets: string;
    disclaimer: string;
    notifications: string;
    manage: string;
    safety: string;
  };
  paywall: {
    title: string;
    body: string;
    annual: string;
    monthly: string;
    founding: string;
    annualBadge: string;
    foundingBadge: string;
    annualSubline: string;
    monthlySubline: string;
    foundingSubline: string;
    startTrial: string;
    chooseMonthly: string;
    chooseFounding: string;
    restore: string;
    continueFree: string;
    free: string;
    pro: string;
  };
  reward: {
    momentumSaved: string;
    continue: string;
    level: string;
  };
  states: {
    movesLeft: string;
    streak: string;
    level: string;
    scoreNow: string;
    activeToday: string;
    locked: string;
  };
  systems: Record<SystemId, { title: string; promise: string; cta: string }>;
}

const EN: UiCopy = {
  tabs: {
    today: 'Today',
    systems: 'Systems',
    progress: 'Progress',
    settings: 'Settings',
  },
  onboarding: {
    title: 'One smart move for today.',
    body: 'Tell us what you need. We will give you one sharp next step in under 10 seconds.',
    goal: 'What do you want more of today?',
    blocker: 'What is slowing you down?',
    time: 'How much time do you have?',
    energy: 'How is your energy?',
    reveal: "Here's your smartest next move.",
    revealBody: 'This can give you a visible win fast.',
    continue: 'Continue',
    start: 'Start now',
    why: 'Why this move',
  },
  today: {
    eyebrow: 'ONE SMART MOVE',
    title: 'Your next move.',
    todayGain: 'WHAT THIS GIVES YOU TODAY',
    tomorrowGain: 'WHAT GETS EASIER TOMORROW',
    tonight: 'TONIGHT CHECK-IN',
    start: 'Start now',
    why: 'Why this move',
    swap: 'Try another',
    refine: 'Refine',
    share: 'Gift or share',
    noMove: 'No move yet.',
    buildMove: 'Build my move',
  },
  guidance: {
    title: 'Guidance',
    whyFits: 'WHY THIS FITS',
    howToStart: 'HOW TO START',
    todayGain: 'WHAT YOU GAIN TODAY',
    tomorrowGain: 'TOMORROW',
    projection: '7-DAY VIEW',
    lockedProjection: 'Unlock the full 7-day view with Pro.',
    start: 'Start now',
    close: 'Close',
  },
  focusRun: {
    title: 'Focus Run',
    start: 'Start focus run',
    makeEasier: 'Make it easier',
    pause: 'Pause',
    resume: 'Resume',
    next: 'Keep going',
    finish: 'Action taken',
    leave: 'Leave for now',
    leaveTitle: 'Leave this run?',
    easyVersion: 'Use 2-minute version',
    leaveAnyway: 'Leave anyway',
    halfway: "You're halfway to a clean win.",
    nearFinish: 'One more minute gives you a real result.',
    completed: 'Move completed.',
    completedBody: 'You turned hesitation into action.',
    scorePrompt: 'How did it go?',
  },
  progress: {
    title: 'Progress',
    momentum: 'Momentum',
    wins: 'Wins',
    pattern: 'Pattern',
    pending: 'Pending score',
    recent: 'Recent moves',
    empty: 'Start one move today and come back tonight to score it.',
    goToday: 'Go to Today',
    shareWin: 'Share win',
  },
  settings: {
    title: 'Settings',
    upgrade: 'Upgrade to Pro',
    restore: 'Restore purchases',
    language: 'Language',
    gift: 'Gift a Pro Move',
    widgets: 'Home screen widgets',
    disclaimer: 'General guidance only',
    notifications: 'Notification intent',
    manage: 'Manage subscription',
    safety: 'This app provides general guidance only. It does not offer medical, mental health, or financial guarantees.',
  },
  paywall: {
    title: 'You felt progress. Now deepen the system.',
    body: 'Free gives you one strong move. Pro improves the move itself.',
    annual: 'Yearly',
    monthly: 'Monthly',
    founding: 'Founding Member',
    annualBadge: 'Best value',
    foundingBadge: 'Gold access',
    annualSubline: '7-day free trial',
    monthlySubline: '$8.99 / month',
    foundingSubline: '$199 one-time • gold badge • early access',
    startTrial: 'Start 7-day free trial',
    chooseMonthly: 'Choose monthly',
    chooseFounding: 'Become a founding member',
    restore: 'Restore purchases',
    continueFree: 'Continue free',
    free: 'Free',
    pro: 'Pro',
  },
  reward: {
    momentumSaved: 'Momentum saved.',
    continue: 'Level up',
    level: 'Level',
  },
  states: {
    movesLeft: 'moves left',
    streak: 'streak',
    level: 'level',
    scoreNow: 'Score now',
    activeToday: 'ACTIVE TODAY',
    locked: 'Locked',
  },
  systems: {
    decide: { title: 'Decide', promise: 'Clarity under pressure.', cta: 'Use this system' },
    learn: { title: 'Learn', promise: 'Visible learning progress.', cta: 'Use this system' },
    earn: { title: 'Earn', promise: 'Create real earning momentum.', cta: 'Use this system' },
    move: { title: 'Move', promise: 'Clean energy, fast.', cta: 'Use this system' },
    reset: { title: 'Reset', promise: 'Lower mental noise.', cta: 'Use this system' },
  },
};

const TR: UiCopy = {
  ...EN,
  tabs: {
    today: 'Bugun',
    systems: 'Sistemler',
    progress: 'Ilerleme',
    settings: 'Ayarlar',
  },
  onboarding: {
    title: 'Bugun icin tek akilli hamle.',
    body: 'Ne ihtiyacin oldugunu soyle. 10 saniyeden kisa surede net sonraki adimi verelim.',
    goal: 'Bugun neyi artirmak istiyorsun?',
    blocker: 'Seni ne yavaslatiyor?',
    time: 'Ne kadar zamanin var?',
    energy: 'Enerjin nasil?',
    reveal: 'Senin icin en net hamle bu.',
    revealBody: 'Bu hamle kisa surede gorunur bir sonuc verebilir.',
    continue: 'Devam',
    start: 'Simdi basla',
    why: 'Neden bu hamle',
  },
  today: {
    eyebrow: 'TEK AKILLI HAMLE',
    title: 'Siradaki hamlen.',
    todayGain: 'BUGUN NE KAZANDIRIR',
    tomorrowGain: 'YARIN NEYI KOLAYLASTIRIR',
    tonight: 'AKSAM CHECK-IN',
    start: 'Simdi basla',
    why: 'Neden bu hamle',
    swap: 'Baska dene',
    refine: 'Incele',
    share: 'Paylas veya hediye et',
    noMove: 'Henuz hamle yok.',
    buildMove: 'Hamlemi kur',
  },
  guidance: {
    title: 'Rehberlik',
    whyFits: 'NEDEN UYGUN',
    howToStart: 'NASIL BASLARSIN',
    todayGain: 'BUGUN NE KAZANDIRIR',
    tomorrowGain: 'YARIN',
    projection: '7 GUN GORUNUMU',
    lockedProjection: 'Tam 7 gunluk gorunum Pro ile acilir.',
    start: 'Simdi basla',
    close: 'Kapat',
  },
  focusRun: {
    title: 'Odak Kosu',
    start: 'Odak kosusunu baslat',
    makeEasier: 'Kolaylastir',
    pause: 'Duraklat',
    resume: 'Devam et',
    next: 'Devam et',
    finish: 'Aksiyon alindi',
    leave: 'Sonra',
    leaveTitle: 'Bu kosudan cikilsin mi?',
    easyVersion: '2 dakikalik versiyonu kullan',
    leaveAnyway: 'Yine de cik',
    halfway: 'Temiz bir kazanc icin yariya geldin.',
    nearFinish: 'Bir dakika daha gercek bir sonuc yaratir.',
    completed: 'Hamle tamamlandi.',
    completedBody: 'Tereddudu aksiyona cevirdin.',
    scorePrompt: 'Nasil gecti?',
  },
  progress: {
    title: 'Ilerleme',
    momentum: 'Momentum',
    wins: 'Kazanclar',
    pattern: 'Kalıp',
    pending: 'Bekleyen skor',
    recent: 'Son hamleler',
    empty: 'Bugun bir hamle baslat, aksama skorlayip geri don.',
    goToday: 'Bugune git',
    shareWin: 'Kazanci paylas',
  },
  settings: {
    title: 'Ayarlar',
    upgrade: "Pro'ya gec",
    restore: 'Satin alimlari geri yukle',
    language: 'Dil',
    gift: 'Pro hamlesi hediye et',
    widgets: 'Ana ekran bileşenleri',
    disclaimer: 'Genel yonlendirme',
    notifications: 'Bildirim niyeti',
    manage: 'Aboneligi yonet',
    safety: 'Bu uygulama yalnizca genel yonlendirme sunar. Tibbi, psikolojik veya finansal garanti vermez.',
  },
  paywall: {
    title: 'Ilerlemeyi hissettin. Simdi sistemi derinlestir.',
    body: 'Free sana tek guclu hamle verir. Pro hamlenin kalitesini artirir.',
    annual: 'Yillik',
    monthly: 'Aylik',
    founding: 'Founding Member',
    annualBadge: 'En iyi fiyat',
    foundingBadge: 'Altin erisim',
    annualSubline: '7 gunluk ucretsiz deneme',
    monthlySubline: 'Aylik 8.99$',
    foundingSubline: 'Tek seferlik 199$ • altin rozet • erken erisim',
    startTrial: '7 gunluk denemeyi baslat',
    chooseMonthly: 'Ayligi sec',
    chooseFounding: 'Founding member ol',
    restore: 'Satin alimlari geri yukle',
    continueFree: 'Free devam et',
    free: 'Free',
    pro: 'Pro',
  },
  reward: {
    momentumSaved: 'Momentum korundu.',
    continue: 'Seviye atla',
    level: 'Seviye',
  },
  states: {
    movesLeft: 'hamle hakki',
    streak: 'seri',
    level: 'seviye',
    scoreNow: 'Skorla',
    activeToday: 'BUGUN AKTIF',
    locked: 'Kilitli',
  },
  systems: {
    decide: { title: 'Karar', promise: 'Baski altinda netlik.', cta: 'Bu sistemi kullan' },
    learn: { title: 'Ogren', promise: 'Gorunur ogrenme cikisi.', cta: 'Bu sistemi kullan' },
    earn: { title: 'Kazan', promise: 'Gercek gelir momentumu.', cta: 'Bu sistemi kullan' },
    move: { title: 'Hareket', promise: 'Hizli enerji toparlanisi.', cta: 'Bu sistemi kullan' },
    reset: { title: 'Reset', promise: 'Zihinsel gurultuyu azalt.', cta: 'Bu sistemi kullan' },
  },
};

export function getUiCopy(language: SupportedLanguage): UiCopy {
  return language === 'tr' ? TR : EN;
}
