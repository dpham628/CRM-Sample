// Deterministic, phrase-pattern based follow-up task extractor.
//
// This is intentionally swappable: an LLM-based extractor can replace it later
// as long as it returns the same shape:
//   extractTasksFromTranscript(transcript) => [{ nextStep, dueOption, duePhrase, snippet }]
// `dueOption` is one of the keys in DUE_OPTIONS from ./due-dates.js.

const ACTION_PATTERNS = [
  { re: /\b(?:send|email|forward|share)\b[^.!?]*\b(?:msa|master services? agreement)\b/i, label: 'Send MSA' },
  { re: /\b(?:send|email|forward|share|write up)\b[^.!?]*\bsummary\b/i, label: 'Send summary email' },
  { re: /\b(?:send|email|forward|share)\b[^.!?]*\bproposal\b/i, label: 'Send proposal' },
  // Negative lookahead keeps "send the MSA agreement" from double-firing with 'Send MSA'.
  { re: /\b(?:send|email|forward|share)\b(?![^.!?]*\bmsa\b)[^.!?]*\b(?:contract|agreement|nda)\b/i, label: 'Send contract' },
  { re: /\b(?:send|email|forward|share)\b[^.!?]*\b(?:pricing|quote)\b/i, label: 'Send pricing' },
  { re: /\b(?:send|email|forward|share)\b[^.!?]*\b(?:deck|slides|presentation)\b/i, label: 'Send deck' },
  { re: /\b(?:send|email|forward|share)\b[^.!?]*\bcase stud/i, label: 'Send case study' },
  { re: /\b(?:schedule|set up|book|arrange)\b[^.!?]*\bdemo\b/i, label: 'Schedule a demo' },
  { re: /\b(?:schedule|set up|book|arrange)\b[^.!?]*\b(?:follow[- ]?up|check[- ]?in|next call|another call)\b/i, label: 'Schedule follow-up call' },
];

// Ordered: first matching due phrase wins. `option` must exist in DUE_OPTIONS.
const DUE_PATTERNS = [
  { re: /\b(?:within|in|next)\s+24\s*hours?\b/i, option: '24h' },
  { re: /\b(?:by|before|until)\s+friday\b|\bend of (?:the )?week\b|\beow\b|\bnext week\b/i, option: 'friday' },
  { re: /\bnext monday\b|\b(?:by|before|on)\s+monday\b/i, option: 'monday' },
  { re: /\btomorrow\b/i, option: 'tomorrow' },
];

const DEFAULT_DUE_OPTION = '24h';

export function extractTasksFromTranscript(transcript) {
  if (!transcript) return [];
  const segments = transcript
    .split(/[.!?\n]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const tasks = [];
  const seen = new Set();

  for (const segment of segments) {
    const due = DUE_PATTERNS.find(({ re }) => re.test(segment));
    // One segment can contain several follow-ups ("send the proposal and a case study").
    for (const action of ACTION_PATTERNS) {
      if (seen.has(action.label) || !action.re.test(segment)) continue;
      tasks.push({
        nextStep: action.label,
        dueOption: due ? due.option : DEFAULT_DUE_OPTION,
        duePhrase: due ? segment.match(due.re)[0] : null,
        snippet: segment,
      });
      seen.add(action.label);
    }
  }

  return tasks;
}
