import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const rootDir = path.resolve(process.cwd(), 'dist');
const outputDir = path.resolve(process.cwd(), 'store', 'screenshots');
const port = 4173;
const storageKey = 'decido-now.app-data.v1';

fs.mkdirSync(outputDir, { recursive: true });

const sampleData = {
  decisions: [
    buildDecision('1', '2026-03-29T08:10:00.000Z', 'language-01', 'done', 5, 'Sesli tekrar iyi geldi.'),
    buildDecision('2', '2026-03-29T20:10:00.000Z', 'earn-02', 'partial', 3, 'Ilk mesaj iyiydi ama devam etmedim.'),
    buildDecision('3', '2026-03-28T09:00:00.000Z', 'learn-04', 'done', 4, 'Ozet cikarmak ise yaradi.'),
    buildDecision('4', '2026-03-28T18:20:00.000Z', 'focus-02', 'done', 5, 'Telefonu ters cevirince iyi akti.'),
    buildDecision('5', '2026-03-27T11:45:00.000Z', 'earn-03', 'skipped', 2, 'Teklif taslagi gozumu korkuttu.'),
    buildDecision('6', '2026-03-27T07:50:00.000Z', 'reset-03', null, null, ''),
  ],
  skipLedger: { dateKey: '2026-03-30', used: 0 },
  devPlanPreview: 'free',
  language: 'en',
  subscription: {
    plan: 'free',
    productId: null,
    status: 'inactive',
    source: 'none',
    lastSyncedAt: null,
  },
  onboardingDone: true,
  currentSystem: 'decide',
  usage: {
    dateKey: '2026-03-30',
    swapsUsed: 0,
    paywallSeen: false,
  },
  persona: 'the-hesitant-pro',
  dnaScores: {
    efficiency: 48,
    intuition: 36,
  },
  notifications: {
    permission: 'granted',
    lastRecallMoveId: null,
    lastRecallAt: null,
    lastStreakSaverDateKey: null,
  },
  streakFreeze: {
    credits: 1,
    savedDateKeys: [],
    lastProtectedDateKey: null,
  },
  gifting: {
    sentCodes: [],
    earnedXp: 0,
    lastReceivedCode: null,
  },
};

const server = http.createServer((req, res) => {
  const reqPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(rootDir, reqPath.split('?')[0]);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  const contentType =
    ext === '.html'
      ? 'text/html'
      : ext === '.js'
        ? 'application/javascript'
        : ext === '.json'
          ? 'application/json'
          : 'image/png';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 428, height: 926 },
    deviceScaleFactor: 3,
  });

  await context.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    { key: storageKey, value: sampleData }
  );

  const page = await freshPage(context);
  await page.screenshot({ path: path.join(outputDir, '01-home.png'), fullPage: false });
  await page.close();

  const guidancePage = await freshPage(context);
  await guidancePage.getByText(/Why this move|Neden bu hamle/, { exact: false }).first().click({ force: true });
  await guidancePage.screenshot({ path: path.join(outputDir, '02-choices.png'), fullPage: false });
  await guidancePage.close();

  const tracksPage = await freshPage(context);
  await tracksPage.getByText('Systems', { exact: true }).click();
  await tracksPage.screenshot({ path: path.join(outputDir, '03-history.png'), fullPage: false });
  await tracksPage.close();

  const progressPage = await freshPage(context);
  await progressPage.getByText('Progress', { exact: true }).click();
  await progressPage.screenshot({ path: path.join(outputDir, '04-review.png'), fullPage: false });
  await progressPage.close();

  const settingsPage = await freshPage(context);
  await settingsPage.getByText('Settings', { exact: true }).click();
  await settingsPage.screenshot({ path: path.join(outputDir, '05-dna.png'), fullPage: false });
  await settingsPage.close();

  await browser.close();
  server.close();
});

async function freshPage(context) {
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
  return page;
}

function buildDecision(id, createdAt, suggestionId, completion, resultScore, reflection) {
  const suggestions = {
    'language-01': {
      id: 'language-01',
      title: '10 kelimelik mini tur',
      action: 'Bugun ihtiyacin olan 10 kelimeyi sec ve her biriyle bir cumle kur.',
      reason: 'Kelimeyi cumleyle ogrenmek hafizada daha iyi kalir.',
      category: 'language',
      preferredModes: ['quick-win', 'stuck'],
      energies: ['low', 'mid'],
      minutes: 10,
      budget: ['free'],
      goals: ['learn', 'connect'],
      frictions: ['unclear', 'avoidant'],
    },
    'earn-02': {
      id: 'earn-02',
      title: 'Mini outreach yap',
      action: 'Potansiyel bir musteriye veya is baglantisina tek net mesaj gonder.',
      reason: 'Gelir tarafinda en zor esik genelde ilk cikistir.',
      category: 'earn',
      preferredModes: ['bold', 'quick-win'],
      energies: ['mid', 'high'],
      minutes: 10,
      budget: ['free'],
      goals: ['earn', 'connect'],
      frictions: ['avoidant', 'anxious'],
    },
    'learn-04': {
      id: 'learn-04',
      title: 'Bugunun tek ozeti',
      action: 'Bugun okudugun veya izledigin seyi 4 cumleyle kendine anlat.',
      reason: 'Ozet cikarmak pasif tuketimi aktif ogrenmeye donusturur.',
      category: 'learn',
      preferredModes: ['reset', 'quick-win'],
      energies: ['low', 'mid'],
      minutes: 5,
      budget: ['free'],
      goals: ['learn'],
      frictions: ['avoidant', 'distracted'],
    },
    'focus-02': {
      id: 'focus-02',
      title: 'Telefonu ters cevir sprinti',
      action: '10 dakika boyunca telefonu kapat ve tek isi bitir.',
      reason: 'Gorunur dikkat dagiticilari kaldirmak odak baslangicini kolaylastirir.',
      category: 'focus',
      preferredModes: ['quick-win', 'deep-focus'],
      energies: ['mid', 'high'],
      minutes: 10,
      budget: ['free'],
    },
    'earn-03': {
      id: 'earn-03',
      title: 'Teklif taslagi cikar',
      action: 'Sunabilecegin tek hizmet icin kisa teklif veya paket taslagi yaz.',
      reason: 'Soyut beceri, paketlenince satilabilir hale gelir.',
      category: 'earn',
      preferredModes: ['deep-focus'],
      energies: ['mid', 'high'],
      minutes: 20,
      budget: ['free'],
      goals: ['earn', 'build'],
      frictions: ['unclear', 'avoidant'],
    },
    'reset-03': {
      id: 'reset-03',
      title: 'Zihin dump',
      action: 'Aklindakileri sansursuz sekilde 5 dakika boyunca bosalt.',
      reason: 'Dusunceleri kagida almak zihindeki baskiyi azaltir.',
      category: 'reset',
      preferredModes: ['reset', 'stuck'],
      energies: ['low', 'mid'],
      minutes: 5,
      budget: ['free'],
    },
  };

  const contextBySuggestion = {
    'language-01': {
      goal: 'learn',
      friction: 'avoidant',
      mode: 'quick-win',
      energy: 'mid',
      minutes: 10,
      budget: 'free',
      category: 'language',
    },
    'earn-02': {
      goal: 'earn',
      friction: 'avoidant',
      mode: 'bold',
      energy: 'mid',
      minutes: 10,
      budget: 'free',
      category: 'earn',
    },
    'learn-04': {
      goal: 'learn',
      friction: 'unclear',
      mode: 'quick-win',
      energy: 'low',
      minutes: 5,
      budget: 'free',
      category: 'learn',
    },
    'focus-02': {
      goal: 'finish',
      friction: 'distracted',
      mode: 'quick-win',
      energy: 'mid',
      minutes: 10,
      budget: 'free',
      category: 'focus',
    },
    'earn-03': {
      goal: 'earn',
      friction: 'anxious',
      mode: 'deep-focus',
      energy: 'mid',
      minutes: 20,
      budget: 'free',
      category: 'earn',
    },
    'reset-03': {
      goal: 'reset',
      friction: 'tired',
      mode: 'reset',
      energy: 'low',
      minutes: 5,
      budget: 'free',
      category: 'reset',
    },
  };

  return {
    id,
    createdAt,
    dateKey: createdAt.slice(0, 10),
    context: contextBySuggestion[suggestionId],
    options: [suggestions[suggestionId]],
    selectedSuggestion: suggestions[suggestionId],
    completion,
    resultScore,
    reflection,
    reviewedAt: completion ? createdAt : null,
  };
}
