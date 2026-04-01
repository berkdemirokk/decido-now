import { Energy, Friction, GrowthDirectionId, PlanTier, SupportedLanguage, SystemId } from '../types';

interface TodayCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  screenTitle: string;
  screenSubtitle: string;
  cardTitle: string;
  directionLine: string;
  loadingMove: string;
  noMove: string;
  fallbackReason: string;
  defaultShortReason: string;
  moveLabel: string;
  whyLabel: string;
  impactLabel: string;
  start: string;
  primaryCtaShort: string;
  why: string;
  swap: string;
  refine: string;
  share: string;
  tonight: string;
  todayGain: string;
  tomorrowGain: string;
  commitLabel: string;
  commitBody: string;
  commitHint: string;
  usageHint: string;
  drawerLabel: string;
  drawerTitle: string;
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
  subtitle: string;
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
  dnaTitle: string;
  dnaBody: string;
  pastMoves: string;
  execution: string;
  stability: string;
  drift: string;
  deeperRead: string;
  deeperReadBody: string;
  firstCloseBody: string;
  adjustmentLabel: string;
  deeperReadLabel: string;
  recentLabel: string;
  identityLine: (score: number) => string;
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
  hookDecision: string;
  hookData: string;
  hookMind: string;
  terms: string;
  close: string;
  protectEyebrow: string;
  pressureHeadline: string;
  supportSoft: string;
  supportHard: string;
  continueCta: string;
  pressureBenefits: string[];
}

interface OnboardingOption<T extends string> {
  value: T;
  label: string;
  body?: string;
}

interface OnboardingStepsCopy {
  direction: { title: string; body: string };
  friction: { title: string; body: string };
  energy: { title: string; body: string };
  loading: { title: string; body: string };
  reveal: { title: string; body: string };
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
  revealEyebrow: string;
  start: string;
  why: string;
  continue: string;
  progressLabel: (current: number, total: number) => string;
  directions: Array<OnboardingOption<GrowthDirectionId>>;
  frictions: Array<OnboardingOption<Friction>>;
  energies: Array<OnboardingOption<Energy>>;
  steps: OnboardingStepsCopy;
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
  badge: string;
}

interface RecoveryCopy {
  badge: string;
  title: string;
  abandonBody: string;
  missedDayBody: string;
  swapFatigueBody: string;
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
  recovery: RecoveryCopy;
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
    systems: 'Modes',
    progress: 'Progress',
    settings: 'Settings',
  },
  today: {
    eyebrow: 'ONE MOVE',
    title: 'One sharp move for today.',
    subtitle: 'See it. Start it. Close it before the day drifts.',
    screenTitle: 'Today',
    screenSubtitle: 'Stay in motion',
    cardTitle: 'Do this now',
    directionLine: 'This is your move today',
    loadingMove: 'Your next move is loading',
    noMove: 'No move is ready yet.',
    fallbackReason: 'Keep the day moving.',
    defaultShortReason: 'No drift',
    moveLabel: 'TODAY',
    whyLabel: 'WHY THIS MOVE',
    impactLabel: 'WHAT IT OPENS',
    start: 'Start',
    primaryCtaShort: 'START',
    why: 'Why',
    swap: 'Swap',
    refine: 'Change Direction',
    share: 'Share',
    tonight: 'TONIGHT',
    todayGain: 'WHAT IT CHANGES TODAY',
    tomorrowGain: 'WHAT GETS LIGHTER TOMORROW',
    commitLabel: 'WHEN YOU START',
    commitBody: 'Focus Run takes over and the move goes live.',
    commitHint: 'Starting turns this into a real block.',
    usageHint: 'This is for execution, not browsing.',
    drawerLabel: 'See route and room left',
    drawerTitle: 'Route and limits',
  },
  guidance: {
    title: 'Why this move',
    whyFits: 'IMPACT',
    howToStart: 'HOW TO ENTER',
    todayGain: 'WHAT THIS SECURES TODAY',
    tomorrowGain: 'WHAT GETS LIGHTER NEXT',
    projection: 'TOMORROW',
    lockedProjection: 'Pro unlocks the deeper read and the cleaner tomorrow line.',
    start: 'Enter Focus Run',
    close: 'Back',
    depthTitle: 'DEEPER READ',
    depthBody: 'Free gives you the short brief. Pro reads resistance, pattern, and recovery with more precision.',
    upgrade: 'Unlock the deeper read',
  },
  focusRun: {
    title: 'Stay with it',
    subtitle: 'Finish this before you switch',
    start: 'Lock In',
    makeEasier: 'Shorten It',
    halfway: 'Halfway. Hold the line.',
    nearFinish: 'Close it now.',
    completed: 'Today secured.',
    completedBody: 'You closed it. Lock the score before the feeling drops.',
    scorePrompt: 'How clean was that close?',
    next: 'Next',
    finish: 'Close It',
    leave: 'Leave',
    leaveTitle: "You'll break momentum",
    leaveBody: 'Leave now and the move stays open.',
    resume: 'Stay',
    easyVersion: '2-Minute Save',
    leaveAnyway: 'Leave',
    prestartLine: 'One move. One block. No drift.',
    activeLine: 'Stay inside it until it closes.',
    recoveryLine: 'This is a recovery run. Keep it short and honest.',
    lockLine: 'The second you start, intention becomes action.',
    partialFollowUp: 'Not fully closed. You can still save today.',
  },
  progress: {
    title: 'Execution DNA',
    momentum: 'Momentum',
    wins: 'This week',
    pattern: 'Pattern',
    pending: 'Still open',
    recent: 'Recent closes',
    empty: 'Close one move and this panel sharpens fast.',
    shareWin: 'Share result',
    controlPanel: 'DNA',
    nextAdjustment: 'NEXT SHIFT',
    dnaTitle: 'Your execution pattern',
    dnaBody: 'This is how you move when the day gets real.',
    pastMoves: 'Past moves',
    execution: 'Execution',
    stability: 'Stability',
    drift: 'Drift',
    deeperRead: 'Deeper read',
    deeperReadBody: 'Sharper pattern reads unlock with Pro.',
    firstCloseBody: 'Close your first move and this panel sharpens.',
    adjustmentLabel: 'TIGHTEN NOW',
    deeperReadLabel: 'DEEPER READ',
    recentLabel: 'RECENT CLOSES',
    identityLine: (score) =>
      score >= 80
        ? 'This is what consistency looks like.'
        : score >= 60
          ? 'Your rhythm is starting to hold.'
          : 'The rhythm is forming. Keep stacking closes.',
  },
  paywall: {
    title: "Don't lose momentum",
    softTitle: "Don't lose momentum",
    hardTitle: "Don't lose momentum",
    annual: 'Yearly Pro',
    monthly: 'Monthly Pro',
    founding: 'Founding',
    annualSubline: 'Best for protecting your rhythm',
    monthlySubline: 'Lower commitment, same system',
    foundingSubline: 'One-time access with early perks',
    annualBadge: 'BEST VALUE',
    foundingBadge: 'LIMITED',
    startTrial: 'Go Premium',
    chooseMonthly: 'Choose Monthly',
    chooseFounding: 'Choose Founding',
    restore: 'Restore Purchases',
    continueFree: 'Stay on Free',
    free: 'Free',
    pro: 'Pro',
    momentumAngle: 'Protect the rhythm before the day gets noisy.',
    accessAngle: 'Unlimited moves, faster recovery, cleaner direction.',
    hookDecision: 'Faster decisions',
    hookData: 'Sharper feedback',
    hookMind: 'Less mental drag',
    terms: 'Terms',
    close: 'Close',
    protectEyebrow: 'PROTECT THE LOOP',
    pressureHeadline: "Don't break momentum here",
    supportSoft: 'Stop now and the next clean move gets harder.',
    supportHard: 'Stop now and the rhythm drops fast.',
    continueCta: 'Keep Going',
    pressureBenefits: [
      'Unlimited moves',
      'Faster recovery',
      'Keep your rhythm',
      'Keep the right next move',
    ],
  },
  onboarding: {
    title: 'Stop looping. Start moving.',
    body: 'We choose one sharp move for today and get you into it fast.',
    goal: 'Which direction matters most right now?',
    blocker: 'What is slowing you down most today?',
    time: 'How much time can you honestly give this?',
    energy: 'How much energy do you have?',
    reveal: 'Your first move is ready.',
    revealBody: 'Get the first close. The rhythm comes after that.',
    revealEyebrow: 'FIRST MOVE',
    start: 'Start',
    why: 'See Why',
    continue: 'Continue',
    progressLabel: (current, total) => `STEP ${current}/${total}`,
    directions: [
      { value: 'mind', label: 'Mind', body: 'Learn, think, widen your range' },
      { value: 'body', label: 'Body', body: 'Train, cut drag, build energy' },
      { value: 'social', label: 'Social', body: 'Reach out, connect, show up' },
      { value: 'money', label: 'Money', body: 'Push work, money, visible moves' },
      { value: 'reset', label: 'Reset', body: 'Cut noise, get back in clean' },
    ],
    frictions: [
      { value: 'unclear', label: 'Unclear' },
      { value: 'distracted', label: 'Scattered' },
      { value: 'tired', label: 'Tired' },
      { value: 'anxious', label: 'Anxious' },
      { value: 'avoidant', label: 'Avoiding' },
    ],
    energies: [
      { value: 'low', label: 'Low' },
      { value: 'mid', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
    steps: {
      direction: {
        title: 'Pick your direction.',
        body: 'We will aim the first move around it.',
      },
      friction: {
        title: 'Show the drag.',
        body: 'We will cut the biggest friction first.',
      },
      energy: {
        title: 'Lock the energy.',
        body: 'The move will match what you can actually carry.',
      },
      loading: {
        title: 'Your move is forming.',
        body: 'We are taking you straight into action.',
      },
      reveal: {
        title: 'Your first move is ready.',
        body: 'Do not think longer. Start clean.',
      },
    },
  },
  settings: {
    title: 'Settings',
    upgrade: 'Open Pro protection',
    widgets: 'WIDGETS',
    gift: 'Gift a move',
    restore: 'Restore purchases',
    manage: 'Manage subscription',
    language: 'Language',
    disclaimer: 'General guidance only',
    safety:
      'Decido Now gives practical direction based on your input. It is not medical, psychological, or financial advice.',
  },
  reward: {
    level: 'Level',
    continue: 'Continue',
    momentumSaved: 'Momentum up',
    momentumTitle: 'You secured today',
    levelShift: 'Your tier just moved up.',
    cleanClose: 'Clean closes make tomorrow easier.',
    badge: 'SECURED',
  },
  recovery: {
    badge: 'COMEBACK',
    title: 'Momentum cracked',
    abandonBody: 'Come back now before the day slips.',
    missedDayBody: 'It is not gone yet. A short comeback still saves today.',
    swapFatigueBody: 'Reset fast and lock the direction back in.',
  },
  states: {
    activeToday: 'LIVE TODAY',
    locked: 'Locked',
    streak: 'day streak',
    moves: 'moves',
    swaps: 'swaps',
  },
  systems: {
    decide: {
      title: 'Decide',
      promise: 'Cut hesitation and close one clear decision.',
      cta: 'Use Decide',
    },
    learn: {
      title: 'Mind',
      promise: 'Turn scattered input into one visible gain.',
      cta: 'Use Mind',
    },
    earn: {
      title: 'Money',
      promise: 'Push one real money move instead of vague intent.',
      cta: 'Use Money',
    },
    move: {
      title: 'Body',
      promise: 'Reset the body so starting gets easier.',
      cta: 'Use Body',
    },
    reset: {
      title: 'Reset',
      promise: 'Drop noise and re-enter the day clean.',
      cta: 'Use Reset',
    },
  },
  helpers: {
    phaseLabel: ({ isPremium, isActivationPhase, activationDay }) =>
      isPremium ? 'PROTECTED' : isActivationPhase ? `START WEEK · DAY ${activationDay ?? 1}` : 'FREE',
    movesLeftLabel: (count) => `${count} moves left`,
    swapsLeftLabel: (count) => `${count} swaps left`,
    unlimitedMoves: 'Unlimited moves',
    unlimitedSwaps: 'Unlimited swaps',
    premiumTease: ({ plan, isActivationPhase }) =>
      plan !== 'free'
        ? 'Protection, deeper guidance, and recovery are live.'
        : isActivationPhase
          ? 'Your first week is wider. Use it to learn the rhythm.'
          : 'Pro keeps hard days from turning into wasted days.',
    recoveryTitle: (kind) =>
      kind === 'cracked' ? 'Momentum cracked' : kind === 'fatigue' ? 'Too much switching' : 'Today can still be saved',
    recoveryCta: (kind) => (kind === 'reset' ? 'Open Reset' : kind === 'save' ? 'Save Today' : 'Recover Now'),
    shareHeadline: (variant) =>
      variant === 'completion'
        ? 'CLEAN CLOSE'
        : variant === 'recovery'
          ? 'COMEBACK'
          : variant === 'streak'
            ? 'MOMENTUM STREAK'
            : 'SMART MOVE',
    shareResult: (variant) =>
      variant === 'completion'
        ? 'Closed one sharp move instead of drifting.'
        : variant === 'recovery'
          ? 'Slipped, reset, and got back in motion.'
          : variant === 'streak'
            ? 'Stacking clean closes instead of overthinking.'
            : 'One sharp move for today.',
    streakSaverTitle: 'Protect the streak',
    streakSaverBody: (credits) => `${credits} freeze credit ready. Save today with a 2-minute reset.`,
    rewardLevelChange: (before, after) => (before === after ? before : `${before} -> ${after}`),
  },
};

const turkishCopy: UiCopy = {
  tabs: {
    today: 'Bugün',
    systems: 'Modlar',
    progress: 'İlerleme',
    settings: 'Ayarlar',
  },
  today: {
    eyebrow: 'TEK HAMLE',
    title: 'Bugün için tek net hamle.',
    subtitle: 'Gör, başla, gün dağılmadan kapat.',
    screenTitle: 'Bugün',
    screenSubtitle: 'Akışta kal',
    cardTitle: 'Bunu şimdi yap',
    directionLine: 'Bugün bunu yapıyorsun',
    loadingMove: 'Sıradaki hamle hazırlanıyor',
    noMove: 'Henüz hazır bir hamle yok.',
    fallbackReason: 'Günü akışta tut.',
    defaultShortReason: 'Erteleme yok',
    moveLabel: 'BUGÜN',
    whyLabel: 'NEDEN BU HAMLE',
    impactLabel: 'NE AÇAR',
    start: 'Başla',
    primaryCtaShort: 'BAŞLA',
    why: 'Neden',
    swap: 'Değiştir',
    refine: 'Yön değiştir',
    share: 'Paylaş',
    tonight: 'BU AKŞAM',
    todayGain: 'BUGÜN NEYİ AÇAR',
    tomorrowGain: 'YARIN NEYİ HAFİFLETİR',
    commitLabel: 'BAŞLARSAN',
    commitBody: 'Focus Run devreye girer ve hamle canlıya geçer.',
    commitHint: 'Başlamak bunu gerçek bir bloğa çevirir.',
    usageHint: 'Burası oyalanmak için değil, hamleyi kapatmak için.',
    drawerLabel: 'Rotayı ve kalan alanı gör',
    drawerTitle: 'Rota ve sınırlar',
  },
  guidance: {
    title: 'Neden bu hamle',
    whyFits: 'ETKİ',
    howToStart: 'NASIL GİRERSİN',
    todayGain: 'BUGÜN NEYİ KORUR',
    tomorrowGain: 'YARIN NEYİ HAFİFLETİR',
    projection: 'YARIN',
    lockedProjection: 'Daha derin okuma ve daha net yarın hattı Pro ile açılır.',
    start: "Focus Run'a gir",
    close: 'Geri',
    depthTitle: 'DERİN OKUMA',
    depthBody: 'Free kısa brifi verir. Pro ise direnci, kalıbı ve toparlanma yolunu daha net açar.',
    upgrade: 'Derin okumayı aç',
  },
  focusRun: {
    title: 'İçeride kal',
    subtitle: 'Başka şeye geçmeden bunu bitir',
    start: 'Kilitle',
    makeEasier: 'Kısalt',
    halfway: 'Yarıyı geçtin. Çizgiyi bozma.',
    nearFinish: 'Şimdi kapat.',
    completed: 'Bugün kilitlendi.',
    completedBody: 'Hamle kapandı. His düşmeden skoru kilitle.',
    scorePrompt: 'Bu kapanış ne kadar temizdi?',
    next: 'Devam',
    finish: 'Kapat',
    leave: 'Çık',
    leaveTitle: 'Momentumu kıracaksın',
    leaveBody: 'Şimdi çıkarsan hamle açık kalır.',
    resume: 'Kal',
    easyVersion: '2 Dakikalık Kurtarma',
    leaveAnyway: 'Çık',
    prestartLine: 'Tek hamle. Tek blok. Sıfır dağılma.',
    activeLine: 'Kapanana kadar içeride kal.',
    recoveryLine: 'Bu bir toparlanma koşusu. Kısa ve net tut.',
    lockLine: 'Başladığın an niyet aksiyona döner.',
    partialFollowUp: 'Tam kapanmadı. Bugün hâlâ kurtarılabilir.',
  },
  progress: {
    title: 'Karar DNA’sı',
    momentum: 'Ritim',
    wins: 'Bu hafta',
    pattern: 'Kalıp',
    pending: 'Açık kalanlar',
    recent: 'Son kapanışlar',
    empty: 'Bir hamle kapat; bu panel hemen keskinleşir.',
    shareWin: 'Sonucu paylaş',
    controlPanel: 'DNA',
    nextAdjustment: 'SIRADAKİ AYAR',
    dnaTitle: 'Yürütme kalıbın',
    dnaBody: 'Gün ciddileştiğinde nasıl hareket ettiğin burada görünür.',
    pastMoves: 'Geçmiş hamleler',
    execution: 'Yürütme',
    stability: 'İstikrar',
    drift: 'Savrulma',
    deeperRead: 'Daha derin okuma',
    deeperReadBody: 'Daha net kalıp okumaları Pro ile açılır.',
    firstCloseBody: 'İlk hamleni kapat; bu panel hemen netleşir.',
    adjustmentLabel: 'ŞİMDİKİ AYAR',
    deeperReadLabel: 'DERİN OKUMA',
    recentLabel: 'SON KAPANIŞLAR',
    identityLine: (score) =>
      score >= 80
        ? 'Artık ritmi koruyan biri gibi gidiyorsun.'
        : score >= 60
          ? 'Daha tutarlı hâlin oturmaya başlıyor.'
          : 'Ritim kuruluyor. Şimdi bunu sabitleme zamanı.',
  },
  paywall: {
    title: 'Momentumu kaybetme',
    softTitle: 'Momentumu kaybetme',
    hardTitle: 'Momentumu kaybetme',
    annual: 'Yıllık Pro',
    monthly: 'Aylık Pro',
    founding: 'Kurucu',
    annualSubline: 'Ritmi korumak için en güçlü seçim',
    monthlySubline: 'Daha hafif giriş, aynı sistem',
    foundingSubline: 'Tek seferlik erişim ve erken ayrıcalık',
    annualBadge: 'EN İYİ DEĞER',
    foundingBadge: 'SINIRLI',
    startTrial: 'Pro’ya Geç',
    chooseMonthly: 'Aylığı Seç',
    chooseFounding: 'Kurucu Ol',
    restore: 'Satın alımları geri yükle',
    continueFree: 'Ücretsiz sürümde kal',
    free: 'Ücretsiz',
    pro: 'Pro',
    momentumAngle: 'Gün gürültülenmeden ritmi koru.',
    accessAngle: 'Sınırsız hamle, daha hızlı toparlanma, daha net yön.',
    hookDecision: 'Daha hızlı karar',
    hookData: 'Daha net geri bildirim',
    hookMind: 'Daha az zihinsel yük',
    terms: 'Koşullar',
    close: 'Kapat',
    protectEyebrow: 'RİTMİ KORU',
    pressureHeadline: 'Momentumu burada kırma',
    supportSoft: 'Şimdi durursan sıradaki temiz hamle zorlaşır.',
    supportHard: 'Şimdi durursan ritim hızla düşer.',
    continueCta: 'Devam Et',
    pressureBenefits: [
      'Sınırsız hamle',
      'Daha hızlı toparlan',
      'Ritmi koru',
      'Sıradaki doğru hamle',
    ],
  },
  onboarding: {
    title: 'Dolanmayı bırak. Başla.',
    body: 'Bugün için tek net hamleyi seçer, seni de hızla içine sokar.',
    goal: 'Şu an en çok hangi yönde ilerlemek istiyorsun?',
    blocker: 'Bugün seni en çok ne yavaşlatıyor?',
    time: 'Gerçekte ne kadar zaman ayırabilirsin?',
    energy: 'Enerjin ne durumda?',
    reveal: 'İlk hamlen hazır.',
    revealBody: 'İlk kapanışı al. Ritim ondan sonra kurulur.',
    revealEyebrow: 'İLK HAMLE',
    start: 'Başla',
    why: 'Nedenini gör',
    continue: 'Devam Et',
    progressLabel: (current, total) => `ADIM ${current}/${total}`,
    directions: [
      { value: 'mind', label: 'Zihin', body: 'Öğren, düşün, ufkunu aç' },
      { value: 'body', label: 'Beden', body: 'Hareket, kilo, enerji' },
      { value: 'social', label: 'Sosyal', body: 'Ulaş, bağ kur, görün' },
      { value: 'money', label: 'Gelir', body: 'İş, para, görünür hamle' },
      { value: 'reset', label: 'Denge', body: 'Gürültüyü kes, temiz dön' },
    ],
    frictions: [
      { value: 'unclear', label: 'Net değilim' },
      { value: 'distracted', label: 'Dağıldım' },
      { value: 'tired', label: 'Yorgunum' },
      { value: 'anxious', label: 'Kaygım yüksek' },
      { value: 'avoidant', label: 'Kaçıyorum' },
    ],
    energies: [
      { value: 'low', label: 'Düşük' },
      { value: 'mid', label: 'Orta' },
      { value: 'high', label: 'Yüksek' },
    ],
    steps: {
      direction: {
        title: 'Bir yön seç.',
        body: 'İlk hamleyi onun etrafında kuracağız.',
      },
      friction: {
        title: 'Sürtünmeyi göster.',
        body: 'İlk olarak en büyük sürtünmeyi keseceğiz.',
      },
      energy: {
        title: 'Enerjiyi kilitle.',
        body: 'Hamle, bugün gerçekten taşıyabileceğin seviyede olacak.',
      },
      loading: {
        title: 'İlk hamlen hazırlanıyor.',
        body: 'Seni doğrudan aksiyona alıyoruz.',
      },
      reveal: {
        title: 'İlk hamlen hazır.',
        body: 'Daha fazla düşünme. Temiz gir.',
      },
    },
  },
  settings: {
    title: 'Ayarlar',
    upgrade: 'Pro korumayı aç',
    widgets: 'WIDGETLAR',
    gift: 'Hamle hediye et',
    restore: 'Satın alımları geri yükle',
    manage: 'Aboneliği yönet',
    language: 'Dil',
    disclaimer: 'Yalnızca genel yönlendirme',
    safety:
      'Decido Now girdilerine göre pratik yön verir. Tıbbi, psikolojik veya finansal tavsiye sunmaz.',
  },
  reward: {
    level: 'Seviye',
    continue: 'Devam',
    momentumSaved: 'Momentum arttı',
    momentumTitle: 'Bugün kilitlendi',
    levelShift: 'Seviyen yükseldi.',
    cleanClose: 'Temiz kapanış yarını kolaylaştırır.',
    badge: 'KİLİTLENDİ',
  },
  recovery: {
    badge: 'GERİ DÖN',
    title: 'Momentum çatladı',
    abandonBody: 'Şimdi dön. Gün tamamen kaymasın.',
    missedDayBody: 'Daha bitmedi. Kısa bir dönüş bugünü kurtarır.',
    swapFatigueBody: 'Kısa bir reset al ve yönü yeniden kilitle.',
  },
  states: {
    activeToday: 'BUGÜN CANLI',
    locked: 'Kilitli',
    streak: 'gün seri',
    moves: 'hamle',
    swaps: 'swap',
  },
  systems: {
    decide: {
      title: 'Karar',
      promise: 'Kararsızlığı kes ve tek net karar kapat.',
      cta: 'Karar modunu aç',
    },
    learn: {
      title: 'Zihin',
      promise: 'Dağınık girdiyi tek net kazanca çevir.',
      cta: 'Zihin modunu aç',
    },
    earn: {
      title: 'Gelir',
      promise: 'Belirsiz para niyetini gerçek bir hamleye çevir.',
      cta: 'Gelir modunu aç',
    },
    move: {
      title: 'Beden',
      promise: 'Bedeni toparla ki başlamak kolaylaşsın.',
      cta: 'Beden modunu aç',
    },
    reset: {
      title: 'Denge',
      promise: 'Gürültüyü kes ve güne temiz geri gir.',
      cta: 'Denge modunu aç',
    },
  },
  helpers: {
    phaseLabel: ({ isPremium, isActivationPhase, activationDay }) =>
      isPremium ? 'PRO KORUMA' : isActivationPhase ? `BAŞLANGIÇ HAFTASI · GÜN ${activationDay ?? 1}` : 'FREE',
    movesLeftLabel: (count) => `${count} hamle kaldı`,
    swapsLeftLabel: (count) => `${count} swap kaldı`,
    unlimitedMoves: 'Sınırsız hamle',
    unlimitedSwaps: 'Sınırsız swap',
    premiumTease: ({ plan, isActivationPhase }) =>
      plan !== 'free'
        ? 'Koruma, daha derin rehberlik ve toparlanma açık.'
        : isActivationPhase
          ? 'İlk hafta daha geniş. Ritmi burada öğren.'
          : 'Pro, zor günlerde ritmi korur.',
    recoveryTitle: (kind) =>
      kind === 'cracked' ? 'Momentum çatladı' : kind === 'fatigue' ? 'Fazla yön değiştirdin' : 'Bugün hâlâ kurtarılabilir',
    recoveryCta: (kind) => (kind === 'reset' ? 'Reseti Aç' : kind === 'save' ? 'Bugünü Kurtar' : 'Şimdi Toparlan'),
    shareHeadline: (variant) =>
      variant === 'completion'
        ? 'TEMİZ KAPANIŞ'
        : variant === 'recovery'
          ? 'GERİ DÖNÜŞ'
          : variant === 'streak'
            ? 'MOMENTUM SERİSİ'
            : 'AKILLI HAMLE',
    shareResult: (variant) =>
      variant === 'completion'
        ? 'Dağılmak yerine tek net hamle kapandı.'
        : variant === 'recovery'
          ? 'Kaydı, resetledi, tekrar harekete geçti.'
          : variant === 'streak'
            ? 'Aşırı düşünmek yerine temiz kapanış biriktiriyor.'
            : 'Bugün için tek net hamle.',
    streakSaverTitle: 'Seriyi koru',
    streakSaverBody: (credits) => `${credits} dondurma hakkın hazır. Bugünü 2 dakikalık reset ile koru.`,
    rewardLevelChange: (before, after) => (before === after ? before : `${before} -> ${after}`),
  },
};

export function getUiCopy(language: SupportedLanguage): UiCopy {
  return language === 'tr' ? turkishCopy : englishCopy;
}
