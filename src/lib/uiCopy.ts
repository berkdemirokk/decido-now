import { PlanTier, SupportedLanguage, SystemId } from '../types';

interface TodayCopy {
  eyebrow: string;
  title: string;
  noMove: string;
  moveLabel: string;
  start: string;
  why: string;
  swap: string;
  refine: string;
  share: string;
  tonight: string;
  todayGain: string;
  tomorrowGain: string;
  commitLabel: string;
  commitBody: string;
  usageHint: string;
}

interface GuidanceCopy {
  title: string;
  whyFits: string;
  howToStart: string;
  todayGain: string;
  tomorrowGain: string;
  projection: string;
  lockedProjection: string;
  start: string;
  close: string;
  depthTitle: string;
  depthBody: string;
  upgrade: string;
}

interface FocusRunCopy {
  title: string;
  start: string;
  makeEasier: string;
  halfway: string;
  nearFinish: string;
  completed: string;
  completedBody: string;
  scorePrompt: string;
  next: string;
  finish: string;
  leave: string;
  leaveTitle: string;
  leaveBody: string;
  resume: string;
  easyVersion: string;
  leaveAnyway: string;
  prestartLine: string;
  activeLine: string;
  recoveryLine: string;
  lockLine: string;
  partialFollowUp: string;
}

interface ProgressCopy {
  title: string;
  momentum: string;
  wins: string;
  pattern: string;
  pending: string;
  recent: string;
  empty: string;
  shareWin: string;
  controlPanel: string;
  nextAdjustment: string;
}

interface PaywallCopy {
  title: string;
  softTitle: string;
  hardTitle: string;
  annual: string;
  monthly: string;
  founding: string;
  annualSubline: string;
  monthlySubline: string;
  foundingSubline: string;
  annualBadge: string;
  foundingBadge: string;
  startTrial: string;
  chooseMonthly: string;
  chooseFounding: string;
  restore: string;
  continueFree: string;
  free: string;
  pro: string;
  momentumAngle: string;
  accessAngle: string;
}

interface OnboardingCopy {
  title: string;
  body: string;
  goal: string;
  blocker: string;
  time: string;
  energy: string;
  reveal: string;
  revealBody: string;
  start: string;
  why: string;
  continue: string;
}

interface SettingsCopy {
  title: string;
  upgrade: string;
  widgets: string;
  gift: string;
  restore: string;
  manage: string;
  language: string;
  disclaimer: string;
  safety: string;
}

interface RewardCopy {
  level: string;
  continue: string;
  momentumSaved: string;
  momentumTitle: string;
  levelShift: string;
  cleanClose: string;
}

interface StatesCopy {
  activeToday: string;
  locked: string;
  streak: string;
  moves: string;
  swaps: string;
}

interface SystemCopyEntry {
  title: string;
  promise: string;
  cta: string;
}

export interface UiCopy {
  tabs: {
    today: string;
    systems: string;
    progress: string;
    settings: string;
  };
  today: TodayCopy;
  guidance: GuidanceCopy;
  focusRun: FocusRunCopy;
  progress: ProgressCopy;
  paywall: PaywallCopy;
  onboarding: OnboardingCopy;
  settings: SettingsCopy;
  reward: RewardCopy;
  states: StatesCopy;
  systems: Record<SystemId, SystemCopyEntry>;
  helpers: {
    phaseLabel: (params: {
      isPremium: boolean;
      isActivationPhase: boolean;
      activationDay: number | null;
    }) => string;
    movesLeftLabel: (count: number) => string;
    swapsLeftLabel: (count: number) => string;
    unlimitedMoves: string;
    unlimitedSwaps: string;
    premiumTease: (params: { plan: PlanTier; isActivationPhase: boolean }) => string;
    recoveryTitle: (kind: 'cracked' | 'salvage' | 'fatigue') => string;
    recoveryCta: (kind: 'reset' | 'save' | 'recover') => string;
    shareHeadline: (variant: 'completion' | 'recovery' | 'streak' | 'preview') => string;
    shareResult: (variant: 'completion' | 'recovery' | 'streak' | 'preview') => string;
    streakSaverTitle: string;
    streakSaverBody: (credits: number) => string;
    rewardLevelChange: (before: string, after: string) => string;
  };
}

const englishCopy: UiCopy = {
  tabs: {
    today: 'Today',
    systems: 'Systems',
    progress: 'Progress',
    settings: 'Settings',
  },
  today: {
    eyebrow: 'ANTI-OVERTHINKING ENGINE',
    title: 'One move. No drift.',
    noMove: 'No move loaded yet.',
    moveLabel: "TODAY'S MOVE",
    start: 'Start now',
    why: 'Why this move',
    swap: 'Try another',
    refine: 'Tune the system',
    share: 'Share the win',
    tonight: 'TONIGHT',
    todayGain: 'WHAT THIS UNLOCKS TODAY',
    tomorrowGain: 'WHAT THIS FIXES TOMORROW',
    commitLabel: 'WHEN YOU START',
    commitBody: 'Focus Run opens, the timer starts, and today begins to count.',
    usageHint: 'Use one clean move well. The system sharpens from execution, not browsing.',
  },
  guidance: {
    title: 'Why this move',
    whyFits: 'WHY THIS FITS',
    howToStart: 'HOW TO RUN IT',
    todayGain: 'WHAT YOU GET TODAY',
    tomorrowGain: 'WHAT GETS EASIER NEXT',
    projection: 'TRAJECTORY',
    lockedProjection: 'Pro opens the longer read: what compounds if you stay with this move.',
    start: 'Enter Focus Run',
    close: 'Back',
    depthTitle: 'PRO DEPTH',
    depthBody:
      'Free gives you the opening. Pro reads resistance, tomorrow impact, and cleaner direction.',
    upgrade: 'Unlock the deeper read',
  },
  focusRun: {
    title: 'Focus Run',
    start: 'Lock it in',
    makeEasier: 'Trim it down',
    halfway: 'Halfway through. Stay clean.',
    nearFinish: 'Close it now.',
    completed: 'Move closed.',
    completedBody: 'You turned intent into motion. Score it while it is still warm.',
    scorePrompt: 'How clean was that close?',
    next: 'Next step',
    finish: 'Close move',
    leave: 'Exit run',
    leaveTitle: 'Break the run?',
    leaveBody:
      'Leaving now records this as unfinished. Use a shorter recovery path if you want to keep the day intact.',
    resume: 'Stay in',
    easyVersion: 'Use 2-minute version',
    leaveAnyway: 'Leave anyway',
    prestartLine: 'This is not planning. This is where the day changes.',
    activeLine: 'The app is quiet now. The move is live.',
    recoveryLine: 'This is a recovery run. Keep it short. Keep it honest.',
    lockLine: 'Starting this spends one execution slot for today.',
    partialFollowUp: 'Not fully closed. You can still salvage the day.',
  },
  progress: {
    title: 'Control panel',
    momentum: 'Momentum',
    wins: 'Wins',
    pattern: 'Pattern',
    pending: 'Still open',
    recent: 'Recent closes',
    empty: 'No closed move yet. Finish one move and the control panel starts making sense.',
    shareWin: 'Share this win',
    controlPanel: 'CONTROL PANEL',
    nextAdjustment: 'NEXT ADJUSTMENT',
  },
  paywall: {
    title: 'Make momentum expensive to lose.',
    softTitle: 'You felt the shift. Keep the system sharp.',
    hardTitle: 'You hit the free edge. Do not stall here.',
    annual: 'Yearly',
    monthly: 'Monthly',
    founding: 'Founding Member',
    annualSubline: '7-day free trial | built for daily follow-through',
    monthlySubline: 'Best if you want a lighter commitment',
    foundingSubline: 'One-time | gold badge | exclusive DNA layers',
    annualBadge: 'BEST VALUE',
    foundingBadge: 'LIMITED',
    startTrial: 'Start yearly trial',
    chooseMonthly: 'Choose monthly',
    chooseFounding: 'Become founding',
    restore: 'Restore purchases',
    continueFree: 'Keep free plan',
    free: 'Free',
    pro: 'Pro',
    momentumAngle: 'Protect momentum. Recover faster. Stop wasting time on friction.',
    accessAngle:
      'Unlock unlimited execution, deeper reading, and stronger protection on hard days.',
  },
  onboarding: {
    title: 'Stop thinking in circles.',
    body: 'Decido Now cuts overthinking down to one sharp move and pushes you into action fast.',
    goal: 'What do you need more of today?',
    blocker: 'What is slowing you down right now?',
    time: 'How much time can you actually give this?',
    energy: 'How much energy do you have?',
    reveal: 'Here is your first move.',
    revealBody: 'You get a few guided moves up front. The more you execute, the more exact this gets.',
    start: 'Take the move',
    why: 'See the reasoning',
    continue: 'Continue',
  },
  settings: {
    title: 'Settings',
    upgrade: 'Protect momentum with Pro',
    widgets: 'WIDGET PREVIEWS',
    gift: 'Gift a Pro move',
    restore: 'Restore purchases',
    manage: 'Manage subscription',
    language: 'Language',
    disclaimer: 'General guidance only',
    safety:
      'Decido Now gives general direction based on your input. It is not medical, psychological, or financial advice.',
  },
  reward: {
    level: 'Level',
    continue: 'Hold the line',
    momentumSaved: 'Today secured.',
    momentumTitle: 'Today secured',
    levelShift: 'Your execution tier just moved up.',
    cleanClose: 'A clean close makes tomorrow easier to enter.',
  },
  states: {
    activeToday: 'ACTIVE TODAY',
    locked: 'Locked',
    streak: 'day streak',
    moves: 'moves',
    swaps: 'swaps',
  },
  systems: {
    decide: {
      title: 'Decide',
      promise: 'Cut hesitation and choose faster.',
      cta: 'Run Decide',
    },
    learn: {
      title: 'Learn',
      promise: 'Turn scattered input into clean recall.',
      cta: 'Run Learn',
    },
    earn: {
      title: 'Earn',
      promise: 'Push money motion instead of vague intent.',
      cta: 'Run Earn',
    },
    move: {
      title: 'Move',
      promise: 'Wake up your body so execution gets easier.',
      cta: 'Run Move',
    },
    reset: {
      title: 'Reset',
      promise: 'Cut noise, lower friction, re-enter cleanly.',
      cta: 'Run Reset',
    },
  },
  helpers: {
    phaseLabel: ({ isPremium, isActivationPhase, activationDay }) =>
      isPremium
        ? 'PRO MOMENTUM'
        : isActivationPhase
          ? `ACTIVATION DAY ${activationDay ?? 1}`
          : 'FREE LIMITS',
    movesLeftLabel: (count) => `${count} moves left`,
    swapsLeftLabel: (count) => `${count} swaps left`,
    unlimitedMoves: 'Unlimited moves',
    unlimitedSwaps: 'Unlimited swaps',
    premiumTease: ({ plan, isActivationPhase }) =>
      plan !== 'free'
        ? 'Full guidance, stronger recovery, and deeper pattern reading are live.'
        : isActivationPhase
          ? 'You have extra room for the first days while the system learns your rhythm.'
          : 'Pro protects streaks, sharpens direction, and removes daily drag.',
    recoveryTitle: (kind) =>
      kind === 'cracked'
        ? 'Momentum cracked'
        : kind === 'fatigue'
          ? 'Decision fatigue is rising'
          : 'Today can still be saved',
    recoveryCta: (kind) =>
      kind === 'reset' ? 'Open reset' : kind === 'save' ? 'Save the day' : 'Recover now',
    shareHeadline: (variant) =>
      variant === 'completion'
        ? "TODAY'S MOVE CLOSED"
        : variant === 'recovery'
          ? 'COMEBACK LOCKED'
          : variant === 'streak'
            ? 'MOMENTUM STREAK'
            : "TODAY'S SMART MOVE",
    shareResult: (variant) =>
      variant === 'completion'
        ? 'Closed one clean move and kept momentum alive.'
        : variant === 'recovery'
          ? 'Slipped, reset, and got back into motion.'
          : variant === 'streak'
            ? 'Stacking clean closes instead of overthinking.'
            : 'One sharp move for today.',
    streakSaverTitle: 'Protect the streak',
    streakSaverBody: (credits) => `${credits} freeze credit ready. Save the day with a 2-minute reset.`,
    rewardLevelChange: (before, after) => (before === after ? before : `${before} -> ${after}`),
  },
};

const turkishCopy: UiCopy = {
  tabs: {
    today: 'Bugun',
    systems: 'Sistemler',
    progress: 'Ilerleme',
    settings: 'Ayarlar',
  },
  today: {
    eyebrow: 'ASIRI DUSUNMEYI KESEN SISTEM',
    title: 'Tek hamle. Sifir dagilma.',
    noMove: 'Henuz bir hamle yuklenmedi.',
    moveLabel: 'BUGUNUN HAMLESI',
    start: 'Hemen basla',
    why: 'Neden bu hamle',
    swap: 'Baska dene',
    refine: 'Sistemi ayarla',
    share: 'Kazanci paylas',
    tonight: 'BU AKSAM',
    todayGain: 'BUGUN NEYI ACAR',
    tomorrowGain: 'YARIN NEYI RAHATLATIR',
    commitLabel: 'BASLADIGINDA',
    commitBody: 'Focus Run acilir, sayac baslar ve bugun gercekten sayilmaya baslar.',
    usageHint: 'Az ama net hamle kullan. Sistem gezinmekten degil, uygulamaktan ogreniyor.',
  },
  guidance: {
    title: 'Neden bu hamle',
    whyFits: 'NEDEN UYUYOR',
    howToStart: 'NASIL CALISTIRILIR',
    todayGain: 'BUGUN NE KAZANDIRIR',
    tomorrowGain: 'SONRA NEYI KOLAYLASTIRIR',
    projection: 'YON',
    lockedProjection: 'Bu hamlenin uzun etkisini gormek icin Pro gerekir.',
    start: 'Focus Runa gir',
    close: 'Geri',
    depthTitle: 'PRO DERINLIGI',
    depthBody:
      'Free sadece girisi verir. Pro direnci, yarin etkisini ve daha temiz yonu gosterir.',
    upgrade: 'Derin okumayi ac',
  },
  focusRun: {
    title: 'Focus Run',
    start: 'Kilitle ve gir',
    makeEasier: 'Kisalt',
    halfway: 'Yarisi bitti. Temiz kal.',
    nearFinish: 'Simdi kapat.',
    completed: 'Hamle kapandi.',
    completedBody: 'Niyeti harekete cevirdin. Sicakken skorla.',
    scorePrompt: 'Bu kapanis ne kadar temizdi?',
    next: 'Siradaki adim',
    finish: 'Hamleyi kapat',
    leave: 'Kosudan cik',
    leaveTitle: 'Kosuyu bozmak istiyor musun?',
    leaveBody:
      'Simdi cikarsan bu kosu yarim kalir. Istersen daha kisa bir kurtarma versiyonuna in.',
    resume: 'Iceride kal',
    easyVersion: '2 dakikalik versiyon',
    leaveAnyway: 'Yine de cik',
    prestartLine: 'Burasi planlama degil. Gunun degistigi nokta burasi.',
    activeLine: 'Arayuz sustu. Hamle su an canli.',
    recoveryLine: 'Bu bir toparlanma kosusu. Kisa tut. Duz tut.',
    lockLine: 'Bastigin anda bugunun execution haklarindan biri kullanilir.',
    partialFollowUp: 'Tam kapanmadi. Gunu hala kurtarabilirsin.',
  },
  progress: {
    title: 'Kontrol paneli',
    momentum: 'Momentum',
    wins: 'Kazanimlar',
    pattern: 'Kalip',
    pending: 'Acik kalanlar',
    recent: 'Son kapanislar',
    empty: 'Henuz kapanan hamle yok. Bir hamle bitir; panel o zaman anlam kazaniyor.',
    shareWin: 'Bu kazanimi paylas',
    controlPanel: 'KONTROL PANELI',
    nextAdjustment: 'SIRADAKI AYAR',
  },
  paywall: {
    title: 'Momentum kaybetmek pahaliya patlar.',
    softTitle: 'Etkiyi hissettin. Sistemi daha keskin kullan.',
    hardTitle: 'Free sinirina geldin. Burada dagilma.',
    annual: 'Yillik',
    monthly: 'Aylik',
    founding: 'Founding Member',
    annualSubline: '7 gun deneme | her gun uygulayanlar icin',
    monthlySubline: 'Daha hafif giris icin',
    foundingSubline: 'Tek seferlik | altin rozet | ozel DNA katmanlari',
    annualBadge: 'EN IYI DEGER',
    foundingBadge: 'LIMITLI',
    startTrial: 'Yillik denemeyi baslat',
    chooseMonthly: 'Ayliga gec',
    chooseFounding: 'Founding ol',
    restore: 'Satin alimi geri yukle',
    continueFree: 'Free ile devam et',
    free: 'Free',
    pro: 'Pro',
    momentumAngle: 'Momentumu koru. Daha hizli toparlan. Surtunmede zaman kaybetme.',
    accessAngle: 'Sinirsiz execution, daha derin okuma ve zor gunlerde daha guclu koruma ac.',
  },
  onboarding: {
    title: 'Kafanin icinde dolanmayi birak.',
    body: 'Decido Now asiri dusunmeyi tek net hamleye indirir ve seni hizli aksiyona iter.',
    goal: 'Bugun en cok neye ihtiyacin var?',
    blocker: 'Su an seni en cok ne yavaslatiyor?',
    time: 'Gercekte ne kadar zaman ayirabilirsin?',
    energy: 'Enerjin ne durumda?',
    reveal: 'Ilk hamlen hazir.',
    revealBody: 'Ilk gunlerde biraz daha fazla alanin olur. Hamleleri kapattikca sistem seni daha net okur.',
    start: 'Hamleyi al',
    why: 'Nedenini gor',
    continue: 'Devam et',
  },
  settings: {
    title: 'Ayarlar',
    upgrade: 'Pro ile momentumu koru',
    widgets: 'WIDGET ONIZLEMELERI',
    gift: 'Pro hamle hediye et',
    restore: 'Satin alimi geri yukle',
    manage: 'Aboneligi yonet',
    language: 'Dil',
    disclaimer: 'Yalnizca genel yonlendirme',
    safety:
      'Decido Now girdilerine gore genel yon verir. Tibbi, psikolojik ya da finansal tavsiye sunmaz.',
  },
  reward: {
    level: 'Seviye',
    continue: 'Hatti koru',
    momentumSaved: 'Bugun korundu.',
    momentumTitle: 'Bugun korundu',
    levelShift: 'Execution seviyen yukari cikti.',
    cleanClose: 'Temiz kapanis yarina girmeyi kolaylastirir.',
  },
  states: {
    activeToday: 'BUGUN AKTIF',
    locked: 'Kilitli',
    streak: 'gun seri',
    moves: 'hamle',
    swaps: 'swap',
  },
  systems: {
    decide: {
      title: 'Karar',
      promise: 'Kararsizligi kes, daha hizli sec.',
      cta: 'Karar modunu ac',
    },
    learn: {
      title: 'Ogren',
      promise: 'Daginik bilgiyi net hatirlama haline cevir.',
      cta: 'Ogren modunu ac',
    },
    earn: {
      title: 'Kazan',
      promise: 'Belirsiz para niyetini gercek harekete cevir.',
      cta: 'Kazan modunu ac',
    },
    move: {
      title: 'Hareket',
      promise: 'Bedeni uyandir, baslamayi kolaylastir.',
      cta: 'Hareket modunu ac',
    },
    reset: {
      title: 'Reset',
      promise: 'Gurultuyu kes, surtunmeyi indir, temiz geri gir.',
      cta: 'Reset modunu ac',
    },
  },
  helpers: {
    phaseLabel: ({ isPremium, isActivationPhase, activationDay }) =>
      isPremium
        ? 'PRO MOMENTUM'
        : isActivationPhase
          ? `AKTIVASYON GUNU ${activationDay ?? 1}`
          : 'FREE LIMITLER',
    movesLeftLabel: (count) => `${count} hamle kaldi`,
    swapsLeftLabel: (count) => `${count} swap kaldi`,
    unlimitedMoves: 'Sinirsiz hamle',
    unlimitedSwaps: 'Sinirsiz swap',
    premiumTease: ({ plan, isActivationPhase }) =>
      plan !== 'free'
        ? 'Derin rehberlik, daha guclu toparlanma ve koruma su an acik.'
        : isActivationPhase
          ? 'Ilk gunlerde biraz daha alanin var. Sistem ritmini ogreniyor.'
          : 'Pro seriyi korur, yonu keskinlestirir ve gunluk dragi azaltir.',
    recoveryTitle: (kind) =>
      kind === 'cracked'
        ? 'Momentum catladi'
        : kind === 'fatigue'
          ? 'Karar yorgunlugu yukseliyor'
          : 'Bugun hala kurtarilabilir',
    recoveryCta: (kind) =>
      kind === 'reset' ? 'Reseti ac' : kind === 'save' ? 'Gunu kurtar' : 'Simdi toparlan',
    shareHeadline: (variant) =>
      variant === 'completion'
        ? 'BUGUNUN HAMLESI KAPANDI'
        : variant === 'recovery'
          ? 'GERI DONUS KILITLENDI'
          : variant === 'streak'
            ? 'MOMENTUM SERISI'
            : 'BUGUNUN AKILLI HAMLESI',
    shareResult: (variant) =>
      variant === 'completion'
        ? 'Bugunku net hamle kapandi ve momentum yasadi.'
        : variant === 'recovery'
          ? 'Kaydi, resetledi, tekrar harekete girdi.'
          : variant === 'streak'
            ? 'Asiri dusunmek yerine temiz kapanis biriktiriyor.'
            : 'Bugun icin tek net hamle.',
    streakSaverTitle: 'Seriyi koru',
    streakSaverBody: (credits) => `${credits} dondurma hakkin hazir. Bugunu 2 dakikalik reset ile koru.`,
    rewardLevelChange: (before, after) => (before === after ? before : `${before} -> ${after}`),
  },
};

export function getUiCopy(language: SupportedLanguage): UiCopy {
  return language === 'tr' ? turkishCopy : englishCopy;
}
