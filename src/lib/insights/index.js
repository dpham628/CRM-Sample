import { deriveInsights } from './derive';
import { MockCrmProvider } from './providers/mock';

// Returns { source, insights } for a CRM contact (a row from
// src/data/accounts.js). Uses the Salesforce MCP provider when SFDC_MCP_URL
// is configured, otherwise falls back to the mock provider.
export const getInsightsForAccount = async (account) => {
  if (!account) return { source: null, insights: [] };

  let provider;
  if (process.env.SFDC_MCP_URL) {
    const { McpSalesforceProvider } = await import('./providers/salesforce-mcp');
    provider = new McpSalesforceProvider();
  } else {
    provider = new MockCrmProvider();
  }

  const records = await provider.fetchCrmData(account);
  return {
    source: provider.source,
    insights: deriveInsights(records),
  };
};
