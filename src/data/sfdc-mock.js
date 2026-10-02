import { addDays, addMonths, subDays } from 'date-fns';

// Salesforce-shaped mock records for the companies in src/data/accounts.js.
// Dates are computed relative to "now" so the insights always look current
// in the demo. Field names mirror real Salesforce objects (Account, Contract,
// Opportunity, Case, Contact) so the mock exercises the same derivation logic
// as the Salesforce MCP provider.
export const getMockSfdcRecords = (company) => {
  const now = new Date();

  const recordsByCompany = {
    'Acme Corp': {
      account: { Name: 'Acme Corp', AnnualRevenue: 4800000 },
      contract: { EndDate: addDays(now, 60), MonthlyRecurringRevenue: 4000 },
      opportunities: [
        { Name: 'Expansion – 50 seats', StageName: 'Negotiation', Amount: 60000, CloseDate: addDays(now, 45) },
      ],
      cases: [
        { Subject: 'SSO login issue', Priority: 'P2', Status: 'Working', CreatedDate: subDays(now, 3) },
      ],
      recentUsers: [
        { Name: 'Priya Nair', CreatedDate: subDays(now, 1) },
        { Name: 'Marco Diaz', CreatedDate: subDays(now, 2) },
        { Name: 'Lena Fischer', CreatedDate: subDays(now, 4) },
      ],
    },
    Globex: {
      account: { Name: 'Globex', AnnualRevenue: 12500000 },
      contract: { EndDate: addMonths(now, 5), MonthlyRecurringRevenue: 9500 },
      opportunities: [
        { Name: 'Pilot – Support team', StageName: 'Prospecting', Amount: 18000, CloseDate: addDays(now, 75) },
      ],
      cases: [
        { Subject: 'Call drops on transfer', Priority: 'P1', Status: 'New', CreatedDate: subDays(now, 1) },
        { Subject: 'Billing discrepancy', Priority: 'P3', Status: 'Escalated', CreatedDate: subDays(now, 12) },
      ],
      recentUsers: [],
    },
    Initech: {
      account: { Name: 'Initech', AnnualRevenue: 2100000 },
      contract: { EndDate: subDays(now, 14), MonthlyRecurringRevenue: 1500 },
      opportunities: [
        { Name: 'Renewal – 25 seats', StageName: 'Qualification', Amount: 22000, CloseDate: addDays(now, 20) },
      ],
      cases: [],
      recentUsers: [
        { Name: 'Sam Berry', CreatedDate: subDays(now, 6) },
      ],
    },
  };

  return recordsByCompany[company] || null;
};
