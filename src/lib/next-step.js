import { differenceInCalendarDays, format } from 'date-fns';

const CLOSED_STAGES = ['Closed Won', 'Closed Lost'];

// Ordered rules; the first match wins. Each returns { label, reason, due } or null.
const rules = [
  ({ openCases }) => {
    const urgent = openCases.find((c) => c.priority === 'High');
    return urgent && {
      label: 'Resolve case before renewal',
      reason: `High-priority case #${urgent.id} (“${urgent.subject}”) is still open.`,
      due: '24h',
    };
  },
  ({ opportunity }, now) => {
    if (CLOSED_STAGES.includes(opportunity.stage)) return null;
    const days = differenceInCalendarDays(new Date(opportunity.closeDate), now);
    return days >= 0 && days <= 14 && {
      label: 'Confirm decision timeline',
      reason: `Close date is ${format(new Date(opportunity.closeDate), 'MMM d')} (${days} days away).`,
      due: '24h',
    };
  },
  ({ opportunity, flags }) =>
    opportunity.stage === 'Proposal' && !flags.msaSent && {
      label: 'Send MSA',
      reason: 'Opportunity is in Proposal but the MSA has not been sent.',
      due: 'friday',
    },
  ({ opportunity, flags }) =>
    opportunity.stage === 'Proposal' && !flags.pricingSent && {
      label: 'Send pricing',
      reason: 'Opportunity is in Proposal but pricing has not been sent.',
      due: 'friday',
    },
  ({ opportunity }) =>
    opportunity.stage === 'Discovery' && {
      label: 'Schedule technical demo',
      reason: 'Opportunity is in Discovery; a demo moves it toward Proposal.',
      due: 'friday',
    },
  ({ opportunity }) =>
    opportunity.stage === 'Prospecting' && {
      label: 'Book discovery call',
      reason: 'Opportunity is still in Prospecting.',
      due: 'friday',
    },
  ({ opportunity, flags }) =>
    opportunity.stage === 'Negotiation' && flags.msaSent && !flags.msaSigned && {
      label: 'Chase MSA signature',
      reason: 'MSA was sent but is not signed yet.',
      due: '24h',
    },
];

const fallback = {
  label: 'Send meeting recap',
  reason: 'No Salesforce rule matched; keep the contact warm.',
  due: '24h',
};

export const suggestNextStep = (context, now = new Date()) => {
  if (!context) return fallback;
  for (const rule of rules) {
    const suggestion = rule(context, now);
    if (suggestion) return suggestion;
  }
  return fallback;
};
