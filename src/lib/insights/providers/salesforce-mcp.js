// Salesforce MCP provider. Connects to a Salesforce MCP server with the
// official MCP TypeScript SDK (@modelcontextprotocol/sdk).
//
// Target & assumptions:
// - Built against Salesforce's hosted "SObject Reads" server
//   (https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads), which
//   exposes a `soqlQuery` tool ({ query } -> array of records). Popular
//   community Salesforce MCP servers expose equivalent query tools; set
//   SFDC_MCP_QUERY_TOOL if yours uses a different name.
// - SFDC_MCP_TOKEN is sent as a bearer token. Salesforce's hosted server uses
//   per-user OAuth 2.0 w/ PKCE — a full OAuth handshake is out of scope here;
//   pass a pre-minted access token, or a server that accepts a static token.
// - "Users signed up" is approximated by Contacts created on the Account in
//   the last 7 days (Salesforce User records aren't linked to an Account).
// - Renewal ARR comes from a renewal-type Opportunity's Amount when the
//   Contract itself carries no ARR field (there is no standard one).

const QUERY_TIMEOUT_MS = 15000;

const escapeSoql = (value) => String(value).replace(/'/g, "\\'");

// MCP tool results arrive as { content: [{ type: 'text', text }] } and/or
// { structuredContent }. Normalize either to an array of records.
const parseRecords = (result) => {
  const sc = result?.structuredContent;
  if (sc) {
    if (Array.isArray(sc)) return sc;
    if (Array.isArray(sc.records)) return sc.records;
    if (Array.isArray(sc.results)) return sc.results;
  }
  const text = result?.content?.find((c) => c.type === 'text')?.text;
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    return parsed.records ?? parsed.results ?? parsed.data ?? [];
  } catch {
    return [];
  }
};

const withTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${QUERY_TIMEOUT_MS}ms`)), QUERY_TIMEOUT_MS)
    ),
  ]);

export class McpSalesforceProvider {
  source = 'Salesforce';

  constructor() {
    this.url = process.env.SFDC_MCP_URL;
    this.token = process.env.SFDC_MCP_TOKEN;
    this.queryTool = process.env.SFDC_MCP_QUERY_TOOL || 'soqlQuery';
  }

  async connect() {
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StreamableHTTPClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/streamableHttp.js'
    );
    const transport = new StreamableHTTPClientTransport(new URL(this.url), {
      requestInit: this.token
        ? { headers: { Authorization: `Bearer ${this.token}` } }
        : undefined,
    });
    const client = new Client({ name: 'crm-insights', version: '1.0.0' });
    await client.connect(transport);
    return client;
  }

  // Resolve the query tool name: env override, else 'soqlQuery', else the
  // first advertised tool that looks like a SOQL query tool.
  async resolveQueryTool(client) {
    if (process.env.SFDC_MCP_QUERY_TOOL) return this.queryTool;
    try {
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name);
      if (names.includes('soqlQuery')) return 'soqlQuery';
      const candidate = names.find((n) => /soql|query/i.test(n));
      if (candidate) return candidate;
    } catch (err) {
      console.warn('Could not list Salesforce MCP tools:', err);
    }
    return this.queryTool;
  }

  async soql(client, tool, query) {
    const result = await withTimeout(
      client.callTool({ name: tool, arguments: { query } }),
      `Salesforce MCP ${tool}`
    );
    if (result?.isError) {
      throw new Error(`Salesforce MCP ${tool} failed: ${JSON.stringify(result.content)}`);
    }
    return parseRecords(result);
  }

  async fetchCrmData(account) {
    const company = account?.company;
    if (!company) return null;

    const client = await withTimeout(this.connect(), 'Salesforce MCP connect');
    try {
      const tool = await this.resolveQueryTool(client);

      const accounts = await this.soql(
        client, tool,
        `SELECT Id, Name FROM Account WHERE Name = '${escapeSoql(company)}' LIMIT 1`
      );
      const sfAccount = accounts[0];
      if (!sfAccount) return { account: { Name: company }, opportunities: [], cases: [], recentUsers: [] };

      const id = sfAccount.Id;
      const [contracts, opportunities, cases, recentUsers] = await Promise.all([
        this.soql(client, tool,
          `SELECT Id, EndDate, ContractTerm FROM Contract WHERE AccountId = '${id}' AND Status = 'Activated' ORDER BY EndDate ASC LIMIT 1`),
        this.soql(client, tool,
          `SELECT Id, Name, StageName, Amount, CloseDate, Type FROM Opportunity WHERE AccountId = '${id}' AND IsClosed = false ORDER BY CloseDate ASC LIMIT 5`),
        this.soql(client, tool,
          `SELECT Id, Subject, Priority, Status, CreatedDate FROM Case WHERE AccountId = '${id}' AND IsClosed = false ORDER BY CreatedDate DESC LIMIT 5`),
        this.soql(client, tool,
          `SELECT Id, Name, CreatedDate FROM Contact WHERE AccountId = '${id}' AND CreatedDate = LAST_N_DAYS:7 ORDER BY CreatedDate DESC LIMIT 20`),
      ]);

      const contract = contracts[0];
      if (contract) {
        const renewalOpp = opportunities.find((o) => /renewal/i.test(`${o.Type || ''} ${o.Name || ''}`));
        if (renewalOpp?.Amount != null) contract.AnnualRecurringRevenue = renewalOpp.Amount;
      }

      return { account: sfAccount, contract, opportunities, cases, recentUsers };
    } finally {
      await client.close().catch(() => {});
    }
  }
}
