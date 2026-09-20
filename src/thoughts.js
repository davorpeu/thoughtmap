// Canonical (English) keys for the automatic-thought library and the cognitive
// distortions. Entries always store these keys, so switching language never
// rewrites saved data — the UI translates at render time (see i18n.js).

// A starter library of common automatic thoughts. The first twelve are the
// worked examples from the classic distortion list (one per distortion); the
// rest are everyday thoughts people log often. Users add their own, which are
// stored in IndexedDB and appear here alongside these.
export const DEFAULT_THOUGHTS = [
  "If I'm not perfect, I'm a failure.",
  "I'll be so anxious I won't be able to cope.",
  'I only did well because it was easy.',
  'I know I did well, but I still feel like a failure.',
  "I'm a loser.",
  "My mistakes prove I'm incompetent; my successes don't count.",
  'One bad result means I did a bad job.',
  "They think I don't know what I'm doing.",
  'I never do anything right.',
  'They were short with me because I did something wrong.',
  'I should be doing better than this.',
  'Nothing about this situation is good.',
  "I'm not good enough.",
  'Nobody likes me.',
  "It's all my fault.",
  "I can't handle this.",
  'Something bad is going to happen.',
  "I'm a burden to the people around me.",
  "I'll never get better.",
  'Everyone is judging me.',
]

// The twelve most common cognitive distortions, in the order they appear on the
// handout. Fixed list — unlike thoughts and emotions, users don't add their own.
export const DISTORTIONS = [
  'All-or-nothing thinking',
  'Catastrophizing',
  'Discounting the positive',
  'Emotional reasoning',
  'Labeling',
  'Magnification / minimization',
  'Mental filter',
  'Mind reading',
  'Overgeneralization',
  'Personalization',
  'Should statements',
  'Tunnel vision',
]
