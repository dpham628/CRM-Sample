const RULES = [
  { id: 'send-msa', pattern: /send (over )?(the |an? )?MSA/i, action: 'Send MSA', due: 'friday' },
  { id: 'share-pricing', pattern: /(share|send) (the |our )?pricing/i, action: 'Share pricing', due: '24h' },
  { id: 'schedule-demo', pattern: /schedule (a |the )?demo/i, action: 'Schedule demo', due: 'friday' },
  { id: 'send-recap', pattern: /send (a |the )?(recap|summary) email/i, action: 'Send recap email', due: '24h' },
  { id: 'send-security-docs', pattern: /send (the |our )?(security docs|SOC 2)/i, action: 'Send security docs', due: '24h' },
  {
    id: 'schedule-deep-dive',
    pattern: /(schedule|set up) (a |the )?(technical )?deep[- ]dive/i,
    action: 'Schedule technical deep dive',
    due: 'friday',
  },
];

export const extractActionItems = (summary) =>
  RULES.map((rule) => ({ rule, index: summary.search(rule.pattern) }))
    .filter(({ index }) => index !== -1)
    .sort((a, b) => a.index - b.index)
    .map(({ rule }) => ({ id: rule.id, action: rule.action, due: rule.due }));
