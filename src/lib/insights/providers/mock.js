import { getMockSfdcRecords } from '@/data/sfdc-mock';

// Default provider when no MCP server is configured. Returns Salesforce-shaped
// mock records so the demo exercises the same derivation logic as a live
// Salesforce MCP server.
export class MockCrmProvider {
  source = 'Salesforce (mock)';

  async fetchCrmData(account) {
    return getMockSfdcRecords(account?.company);
  }
}
