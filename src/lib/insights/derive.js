import { differenceInDays, format, formatDistanceToNowStrict } from 'date-fns';

// Maps normalized Salesforce-shaped records ({ account, contract,
// opportunities, cases, recentUsers }) to short, glanceable insights.
// Shared by the mock and Salesforce MCP providers so both exercise the
// same derivation logic.

const fmtMoney = (amount) => {
  if (amount == null) return null;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}k`;
  return `$${amount}`;
};

const isOpen = (stageOrStatus) =>
  stageOrStatus && !/^closed/i.test(String(stageOrStatus).trim());

export const deriveInsights = (records) => {
  if (!records) return [];
  const insights = [];
  const now = new Date();
  const { contract, opportunities = [], cases = [], recentUsers = [] } = records;

  if (contract?.EndDate) {
    const end = new Date(contract.EndDate);
    const relative = formatDistanceToNowStrict(end, { addSuffix: true });
    const arrValue = contract.AnnualRecurringRevenue
      ?? (contract.MonthlyRecurringRevenue != null ? contract.MonthlyRecurringRevenue * 12 : null);
    const arr = fmtMoney(arrValue);
    const timing = end < now ? `Renewal was ${relative.replace(' ago', '')} ago` : `Renewal ${relative}`;
    insights.push({
      kind: 'renewal',
      text: `${timing} (${format(end, 'MMM d, yyyy')})${arr ? ` — ${arr} ARR` : ''}`,
    });
  }

  opportunities
    .filter((opp) => isOpen(opp.StageName))
    .slice(0, 2)
    .forEach((opp) => {
      const parts = [`Opportunity '${opp.Name}' in ${opp.StageName}`];
      const details = [
        fmtMoney(opp.Amount),
        opp.CloseDate ? `closes ${format(new Date(opp.CloseDate), 'MMM d')}` : null,
      ].filter(Boolean);
      insights.push({ kind: 'opportunity', text: `${parts}${details.length ? ` — ${details.join(', ')}` : ''}` });
    });

  cases
    .filter((c) => isOpen(c.Status))
    .slice(0, 2)
    .forEach((c) => {
      insights.push({
        kind: 'case',
        text: `Open support case: ${c.Subject}${c.Priority ? ` (${c.Priority})` : ''}`,
      });
    });

  const newUsers = recentUsers.filter(
    (u) => u.CreatedDate && differenceInDays(now, new Date(u.CreatedDate)) <= 7
  ).length;
  if (newUsers > 0) {
    insights.push({
      kind: 'users',
      text: `${newUsers} additional user${newUsers === 1 ? '' : 's'} signed up this week`,
    });
  }

  return insights.map((insight, index) => ({ id: `${insight.kind}-${index}`, ...insight }));
};
