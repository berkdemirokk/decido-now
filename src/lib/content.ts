import { DAILY_SPARKS } from '../data/suggestions';
import { Suggestion, SupportedLanguage } from '../types';

const EN_SUGGESTION_COPY: Record<string, { title: string; action: string; reason: string }> = {
  'focus-01': {
    title: 'One-page start',
    action: 'Shrink the open task into a one-page first draft.',
    reason: 'When starting feels hard, reducing scope creates fast momentum.',
  },
  'focus-02': {
    title: 'Phone-down sprint',
    action: 'Turn your phone over and finish one thing for 10 minutes.',
    reason: 'Removing visible distractions lowers the friction to focus.',
  },
  'focus-03': {
    title: '25-minute block',
    action: 'Choose one target and work only on that for 25 minutes.',
    reason: 'A clear time box pushes the brain from deciding into doing.',
  },
  'focus-04': {
    title: 'Close one lingering mail',
    action: 'Finish and send one email that has been waiting too long.',
    reason: 'Closing one loose end quickly reduces mental load.',
  },
  'focus-05': {
    title: 'Cut the list in half',
    action: "Keep only the two highest-impact tasks on today's list.",
    reason: 'Fewer choices reduce decision fatigue.',
  },
  'focus-06': {
    title: 'Inbox zero mini round',
    action: 'For 10 minutes, only delete, archive, or delegate.',
    reason: 'Clearing ambiguous inputs makes later decisions easier.',
  },
  'focus-07': {
    title: 'Reduce it to 3 steps',
    action: 'Write the problem in your head as 3 concrete next steps.',
    reason: 'Abstract pressure gets easier when it becomes specific.',
  },
  'health-01': {
    title: '7-minute body reset',
    action: 'Do 7 minutes of neck, shoulder, and back stretching.',
    reason: 'Less body tension often leads to clearer decisions.',
  },
  'health-02': {
    title: 'Water and walk',
    action: 'Drink a large glass of water and take a 10-minute walk.',
    reason: 'Light movement is the safest way out of low-energy fog.',
  },
  'health-03': {
    title: 'Protein snack',
    action: 'Prepare a short, balanced snack instead of waiting for the next meal.',
    reason: 'Blood sugar swings affect decision quality directly.',
  },
  'health-04': {
    title: 'Screen-free breathing',
    action: 'Step away from screens and breathe rhythmically for 4 minutes.',
    reason: 'A short breathing reset calms the nervous system.',
  },
  'health-05': {
    title: 'Catch daylight',
    action: 'Go outside, get daylight, and walk briskly for 10 minutes.',
    reason: 'Changing environment quickly lifts energy and mood.',
  },
  'health-06': {
    title: 'Prepare for sleep',
    action: 'Set a 20-minute screen-off ritual for tonight.',
    reason: 'Better decisions tomorrow begin with better sleep tonight.',
  },
  'health-07': {
    title: 'Micro core round',
    action: 'Do a 5-minute round of plank, bridge, and squat.',
    reason: 'Short strength work wakes the body and increases confidence.',
  },
  'health-08': {
    title: '10-minute rhythm boost',
    action: 'Put on music and do 10 minutes of brisk walking or marching in place.',
    reason: 'Rhythmic movement lowers drag when starting feels heavy.',
  },
  'health-09': {
    title: 'Stairs reset',
    action: 'Do 2-3 rounds of stairs or a short pulse-raising burst.',
    reason: 'A brief pulse increase can cut through mental fog fast.',
  },
  'health-10': {
    title: 'Pre-sleep release',
    action: 'Do 5 minutes of slow hip, back, and neck release work.',
    reason: 'Evening release supports better energy and decisions tomorrow.',
  },
  'money-01': {
    title: '10-minute spending scan',
    action: 'Review your spending from the last 3 days on one screen.',
    reason: 'The first step to lower money stress is clear visibility.',
  },
  'money-02': {
    title: 'No buying today',
    action: 'Move all non-essential purchases into a 24-hour waiting list.',
    reason: 'Delay here is not avoidance, it is protection from low-quality decisions.',
  },
  'money-03': {
    title: 'Subscription cleanup',
    action: 'Cancel one unused subscription or put it on a cancel list.',
    reason: 'Small savings restore a sense of control.',
  },
  'money-04': {
    title: 'Micro budget choice',
    action: 'Set a spending limit for one category this week.',
    reason: 'Changing one category is more realistic than rebuilding your whole life.',
  },
  'money-05': {
    title: 'Name your statement',
    action: 'Tag your top 3 expenses this month as need, joy, or drift.',
    reason: 'Naming spending patterns helps you notice repeats.',
  },
  'money-06': {
    title: 'Check one price',
    action: 'Do one extra price comparison for the item you want to buy.',
    reason: 'A single comparison softens impulse decisions.',
  },
  'money-07': {
    title: 'Replace one paid treat',
    action: "Swap today's comfort spend with a free alternative.",
    reason: 'You can test money behavior without feeling deprived.',
  },
  'social-01': {
    title: 'One message is enough',
    action: 'Send one short message to someone you have not contacted in a while.',
    reason: 'The hardest part of connection is often the first move.',
  },
  'social-02': {
    title: 'Plan a quick coffee',
    action: 'Suggest one short meetup this week and propose a specific time.',
    reason: 'Clear social plans get more replies than vague ones.',
  },
  'social-03': {
    title: 'Send a thank-you note',
    action: 'Message one person who has helped you recently.',
    reason: 'Gratitude quickly strengthens connection and mood.',
  },
  'social-04': {
    title: 'Finish the pending reply',
    action: 'Reply to one waiting message with a single clear sentence.',
    reason: 'Social pressure often comes from small unfinished loops.',
  },
  'social-05': {
    title: 'Family check-in',
    action: 'Do a 5-minute check-in with one family member.',
    reason: 'Short contact still keeps closeness alive.',
  },
  'social-06': {
    title: 'Make one call',
    action: 'Call one person instead of texting and talk for 10 minutes.',
    reason: 'Live contact builds more connection than endless texting.',
  },
  'social-07': {
    title: 'Make a small invitation',
    action: 'Suggest a simple two-person plan for this week.',
    reason: 'Small invitations need less social energy to act on.',
  },
  'reset-01': {
    title: 'Desk reset',
    action: 'Leave only what you need for the next task in your workspace.',
    reason: 'Physical simplification lowers mental noise too.',
  },
  'reset-02': {
    title: 'Put away 3 things',
    action: 'Return only 3 visible items to their place.',
    reason: 'Micro order is more sustainable than a giant cleanup.',
  },
  'reset-03': {
    title: 'Mind dump',
    action: 'Unload what is in your head for 5 minutes without editing.',
    reason: 'Writing thoughts down reduces background pressure.',
  },
  'reset-04': {
    title: 'Clean one meter',
    action: 'Clean only a one-meter area where you live.',
    reason: 'A small visible win can create a full reset feeling.',
  },
  'reset-05': {
    title: 'Music reset',
    action: 'Tidy your space for the length of one song.',
    reason: 'Music softens time pressure and helps you begin.',
  },
  'reset-06': {
    title: 'Notification fast',
    action: 'Turn on silent mode for one hour and protect one thing.',
    reason: 'When system-level distractions stop, energy returns.',
  },
  'reset-07': {
    title: 'Offload tomorrow',
    action: 'Finish one tiny task now so tomorrow does not inherit it.',
    reason: 'Removing weight from the future lowers evening stress.',
  },
  'growth-01': {
    title: 'Read 5 pages',
    action: 'Read just 5 pages from something that moves you forward.',
    reason: 'Short learning doses repeat more easily.',
  },
  'growth-02': {
    title: 'One learning note',
    action: 'Save one thing you learned today as a note.',
    reason: 'Writing it down turns consumption into application.',
  },
  'growth-03': {
    title: 'Mini skill drill',
    action: 'Practice one micro-skill for 20 minutes.',
    reason: 'Small skill blocks build confidence and visible progress.',
  },
  'growth-04': {
    title: "Write tomorrow's target",
    action: "Turn tomorrow's main win into one sentence.",
    reason: 'Naming tomorrow in advance reduces uncertainty.',
  },
  'growth-05': {
    title: 'Curiosity note',
    action: 'Write one question you are curious about and look up the answer.',
    reason: 'Curiosity creates learning energy without force.',
  },
  'growth-06': {
    title: 'Reopen an old note',
    action: 'Bring one old note back into today and update it.',
    reason: 'Reusing what you already captured increases progress.',
  },
  'growth-07': {
    title: 'Quick idea prototype',
    action: 'Turn your idea into a one-screen or one-paragraph draft.',
    reason: 'Prototypes convert thought into testable reality.',
  },
  'learn-01': {
    title: '10-minute topic scan',
    action: 'Do a quick source scan for one topic you care about and note 3 bullets.',
    reason: 'Learning becomes more repeatable when it ends with a concrete output.',
  },
  'learn-02': {
    title: 'Learn one concept',
    action: 'Pick one concept today, write its definition, and find one example.',
    reason: 'Focusing on one concept reduces information overload.',
  },
  'learn-03': {
    title: 'Mini knowledge map',
    action: 'Sketch a mini mind map around the topic you want to understand better.',
    reason: 'Visualizing information quickly reduces confusion.',
  },
  'learn-04': {
    title: 'One summary for today',
    action: 'Explain what you read or watched today in 4 short sentences.',
    reason: 'Summaries turn passive consumption into active learning.',
  },
  'learn-05': {
    title: '20-minute source sprint',
    action: 'Open one resource and focus on a single subtopic for 20 minutes.',
    reason: 'A narrow subtopic keeps broad topics from becoming overwhelming.',
  },
  'learn-06': {
    title: 'Feynman mini test',
    action: 'Write one thing you learned today as if explaining it to a six-year-old.',
    reason: 'Explaining simply exposes understanding gaps quickly.',
  },
  'learn-07': {
    title: 'Hunt one question',
    action: 'Pick one question you still do not understand, answer it, and add it to your notes.',
    reason: 'A single-question focus turns learning from vague into clear.',
  },
  'learn-08': {
    title: 'Use the knowledge',
    action: 'Turn one idea you learned into a real example you can apply today.',
    reason: 'Knowledge feels stickier and more rewarding when it gets used.',
  },
  'language-01': {
    title: '10-word micro round',
    action: 'Choose 10 useful words for today and write one sentence for each.',
    reason: 'Words stick better when they are tied to sentences.',
  },
  'language-02': {
    title: '3-minute spoken repeat',
    action: 'Read a short text out loud for 3 minutes and focus on pronunciation.',
    reason: 'Speaking out loud softens language anxiety quickly.',
  },
  'language-03': {
    title: 'Practice one dialogue',
    action: 'Pick one daily situation and write a 5-line mini dialogue for it.',
    reason: 'Working inside real contexts makes language more usable.',
  },
  'language-04': {
    title: 'Listen and catch',
    action: 'Play a short foreign-language clip and note 3 expressions you understood.',
    reason: 'Catching fragments keeps momentum alive better than chasing perfection.',
  },
  'language-05': {
    title: 'Voice note to yourself',
    action: 'Record a 30-second voice note to yourself in your target language.',
    reason: 'Talking to yourself builds speaking muscle without social pressure.',
  },
  'language-06': {
    title: 'Pattern of the day',
    action: 'Choose one useful language pattern for today and build 5 sentences with it.',
    reason: 'Overusing one pattern on purpose grows fluency fast.',
  },
  'language-07': {
    title: 'Mini listening repeat',
    action: 'Play a 20-second clip three times and repeat it in the same rhythm.',
    reason: 'Short repeats connect listening and speaking faster.',
  },
  'language-08': {
    title: 'Speak without fixing',
    action: 'Talk for 2 minutes without stopping and focus only on keeping flow.',
    reason: 'At first, fluency builds confidence faster than perfect accuracy.',
  },
  'earn-01': {
    title: 'Choose one income idea',
    action: 'Pick one income idea today and reduce it to a one-line value proposition.',
    reason: 'Income grows faster when the offer becomes clear.',
  },
  'earn-02': {
    title: 'Do one outreach',
    action: 'Send one clear message to a potential client or useful contact.',
    reason: 'The hardest threshold in earning is usually the first reach-out.',
  },
  'earn-03': {
    title: 'Draft one offer',
    action: 'Write a short package draft for one service you could sell.',
    reason: 'A vague skill becomes sellable once it is packaged.',
  },
  'earn-04': {
    title: 'Find the income bottleneck',
    action: 'Write the single bottleneck blocking your income plan and choose one fix.',
    reason: 'Visible bottlenecks make it easier to spend energy in the right place.',
  },
  'earn-05': {
    title: 'Productize and price it',
    action: 'Turn one skill into a one-line service and write a starting price next to it.',
    reason: 'Pricing creates a bridge between ideas and real revenue.',
  },
  'earn-06': {
    title: 'Send a follow-up',
    action: 'Send one short follow-up message to someone who did not reply before.',
    reason: 'In earning, money often closes on the follow-up, not the first touch.',
  },
  'earn-07': {
    title: 'One-line portfolio proof',
    action: 'Turn one piece of work into a single result-driven case study line.',
    reason: 'Clear outcome language makes your skill more sellable.',
  },
  'earn-08': {
    title: 'Find one income lever',
    action: 'Choose the single skill lever that could raise your income fastest and note it.',
    reason: 'Focusing the right skill grows revenue faster than random effort.',
  },
  'earn-09': {
    title: 'Mini landing draft',
    action: 'Write a 3-block mini landing page draft for what you sell.',
    reason: 'A packaged offer is easier to sell than a scattered idea.',
  },
  'reset-08': {
    title: 'Close one loop',
    action: 'Close one small open loop right now and clear it off your list.',
    reason: 'Open loops keep the mind heavier than they look.',
  },
  'reset-09': {
    title: 'Micro meditation',
    action: 'Return only to your breath for 2 minutes and clear the noise.',
    reason: 'A short calm-down can lower decision fatigue immediately.',
  },
  'reset-10': {
    title: 'Make room for tomorrow',
    action: 'Create one quiet opening block for tomorrow morning and lock it in.',
    reason: 'Lightening tomorrow from tonight reduces evening stress.',
  },
};

const EN_SPARKS = [
  {
    title: 'Win something small today.',
    body: 'Do not chase a huge leap. One clean decision can change the tone of your day.',
  },
  {
    title: 'Indecision has a cost too.',
    body: 'Not choosing is still a choice. Replace waiting with a micro move today.',
  },
  {
    title: 'Fewer options, more motion.',
    body: 'Do not tire your mind. Put 3 clean choices in front of it and act.',
  },
  {
    title: 'Speed can come before confidence.',
    body: 'Do not wait for inspiration. Decide in 10 seconds and start.',
  },
  {
    title: 'Be clear, not harsh, with yourself.',
    body: 'What you need today is not pressure. It is a clean next step.',
  },
  {
    title: 'When the body resets, decisions improve.',
    body: 'In low-energy moments, reset the environment before the system.',
  },
  {
    title: 'Ask the right question.',
    body: 'Not: how do I solve everything today. Ask: what should I do next?',
  },
  {
    title: 'Micro goals matter.',
    body: 'A clear 72-hour target often beats a vague 90-day promise.',
  },
];

export function localizeSuggestion(suggestion: Suggestion, language: SupportedLanguage) {
  if (language === 'tr') {
    return suggestion;
  }

  const translated = EN_SUGGESTION_COPY[suggestion.id];

  if (!translated) {
    return suggestion;
  }

  return {
    ...suggestion,
    title: translated.title,
    action: translated.action,
    reason: translated.reason,
  };
}

export function getLocalizedSpark(language: SupportedLanguage) {
  if (language === 'tr') {
    return DAILY_SPARKS[new Date().getDate() % DAILY_SPARKS.length];
  }

  return EN_SPARKS[new Date().getDate() % EN_SPARKS.length];
}
