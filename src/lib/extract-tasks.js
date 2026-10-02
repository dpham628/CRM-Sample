// Deterministic, phrase-pattern based follow-up task extractor.
//
// This is intentionally swappable: an LLM-based extractor can replace it later
// as long as it returns the same shape:
//   extractTasksFromTranscript(transcript) =>
//     [{ nextStep, dueOption, duePhrase, snippet, ownerId, type, priority }]
// `dueOption` is one of the keys in DUE_OPTIONS from ./due-dates.js.
// `ownerId` references src/data/team.js (the rep by default; someone else when
// the transcript hands the action off). `type` is 'task' | 'handoff' |
// 'escalation'; `priority` is 'normal' | 'high'.

import { team, currentRep, repManager, CURRENT_REP_ID } from '../data/team.js';

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
  // Approvals + customer-service follow-ups (often owned by someone else).
  { re: /\bapprov\w*\b[^.!?]*\bdiscount\b/i, label: 'Approve discount' },
  { re: /\b(?:approv\w*|sign[- ]?off)\b[^.!?]*\b(?:contract|terms|order|renewal|pricing|deal)\b/i, label: 'Get approval' },
  { re: /\b(?:reach out|follow[- ]?up|get back|call|resolve|refund|credit)\b[^.!?]*\b(?:duplicate|overcharg\w*|charg\w*|refund|billing|invoice|payment)\b/i, label: 'Follow up on billing issue' },
  { re: /\b(?:reach out|follow[- ]?up|replace|ship|resolve|investigate|look into)\b[^.!?]*\b(?:replacement|defect|broken|damaged|order)\b/i, label: 'Follow up on order issue' },
];

// Ordered: first matching due phrase wins. `option` must exist in DUE_OPTIONS.
const DUE_PATTERNS = [
  { re: /\b(?:within|in|next)\s+24\s*hours?\b/i, option: '24h' },
  { re: /\b(?:by|before|until)\s+friday\b|\bend of (?:the )?week\b|\beow\b|\bnext week\b/i, option: 'friday' },
  { re: /\bnext monday\b|\b(?:by|before|on)\s+monday\b/i, option: 'monday' },
  { re: /\btomorrow\b/i, option: 'tomorrow' },
];

const DEFAULT_DUE_OPTION = '24h';

// --- Owner detection -----------------------------------------------------

// alias -> member, longest alias first so "billing manager" beats "manager".
const ALIAS_INDEX = team
  .flatMap((member) => member.aliases.map((alias) => ({ member, alias })))
  .sort((a, b) => b.alias.length - a.alias.length);

const findOwnerByAlias = (text) => {
  const lower = text.toLowerCase();
  const hit = ALIAS_INDEX.find(({ alias }) => lower.includes(alias));
  return hit ? hit.member : null;
};

const findOwnerByFirstName = (name) =>
  team.find((member) => member.name.split(' ')[0].toLowerCase() === name.toLowerCase());

const ESCALATION_RE = /\bescalat\w*\b/i;
// The words right after a delegation verb usually name the new owner:
//   "have Priya from Legal send…", "loop in my manager", "ask our CSM to…"
const DELEGATION_RE =
  /\b(?:have|get|ask|loop in|bring in|pull in|hand\s+(?:this|it|that)\s+off\s+to|assign\s+(?:this|it|that)\s+to|delegate\s+(?:this|it|that)\s+to|leave\s+(?:this|it|that)\s+with)\s+(.{0,80})/i;
// "Priya will send…", "the billing team will reach out…"
const NAMED_OWNER_RE = /\b([A-Z][a-z]+)\s+(?:will|is going to|'ll|should|needs to|can)\b/;
const TEAM_SUBJECT_RE = /\b((?:[a-z]+\s+){0,3}(?:team|department|manager))\s+(?:will|'ll|is going to|should|can)\b/i;

const detectOwner = (segment) => {
  if (ESCALATION_RE.test(segment)) {
    // The escalation target follows "to": "escalate this to our billing manager".
    const afterVerb = segment.split(ESCALATION_RE)[1] || '';
    const owner = findOwnerByAlias(afterVerb) || repManager;
    return { member: owner, escalation: true };
  }
  const delegation = segment.match(DELEGATION_RE);
  if (delegation) {
    const owner = findOwnerByAlias(delegation[1]);
    if (owner) return { member: owner, escalation: false };
  }
  const named = segment.match(NAMED_OWNER_RE);
  if (named) {
    const owner = findOwnerByFirstName(named[1]);
    if (owner && owner.id !== CURRENT_REP_ID) return { member: owner, escalation: false };
  }
  const teamSubject = segment.match(TEAM_SUBJECT_RE);
  if (teamSubject) {
    const owner = findOwnerByAlias(teamSubject[1]);
    if (owner) return { member: owner, escalation: false };
  }
  return { member: currentRep, escalation: false };
};

// Ordered: first matching topic names the escalation task.
const ESCALATION_TOPICS = [
  { re: /\b(?:duplicate|double|extra|incorrect|wrong)\s+charg\w*\b|\bovercharg\w*\b|\bcharged twice\b/i, topic: 'duplicate charge' },
  { re: /\brefund\w*\b/i, topic: 'refund' },
  { re: /\bdefect\w*\b|\bbroken\b|\bdamaged\b|\bwrong (?:item|order|product)\b/i, topic: 'order issue' },
  { re: /\b(?:outage|downtime|service (?:is )?down|incident)\b/i, topic: 'service issue' },
  { re: /\bbilling\b|\binvoice\b|\bpayment\b|\bcharg\w*\b/i, topic: 'billing issue' },
];

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
    const dueOption = due ? due.option : DEFAULT_DUE_OPTION;
    const duePhrase = due ? segment.match(due.re)[0] : null;
    const owner = detectOwner(segment);

    // An escalation is one task for the escalation target; the delegated
    // verbs in the same sentence ("they'll reach out") belong to it.
    if (owner.escalation) {
      const topic = ESCALATION_TOPICS.find(({ re }) => re.test(segment));
      tasks.push({
        nextStep: `Escalate ${topic ? topic.topic : 'issue'}`,
        dueOption,
        duePhrase,
        snippet: segment,
        ownerId: owner.member.id,
        type: 'escalation',
        priority: 'high',
      });
      continue;
    }

    // One segment can contain several follow-ups ("send the proposal and a case study").
    for (const action of ACTION_PATTERNS) {
      if (seen.has(action.label) || !action.re.test(segment)) continue;
      tasks.push({
        nextStep: action.label,
        dueOption,
        duePhrase,
        snippet: segment,
        ownerId: owner.member.id,
        type: owner.member.id === CURRENT_REP_ID ? 'task' : 'handoff',
        priority: 'normal',
      });
      seen.add(action.label);
    }
  }

  return tasks;
}
