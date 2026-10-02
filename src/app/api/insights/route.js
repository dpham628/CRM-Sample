import { findAccountById, findAccountByPhone, accounts } from '@/data/accounts';
import { getInsightsForAccount } from '@/lib/insights';

// GET /api/insights?accountId=<id> | ?phone=<number> | ?company=<name>
// Serves the Insights card: short facts from an external CRM data source
// (Salesforce via MCP when configured, mock data otherwise).
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const phone = searchParams.get('phone');
    const company = searchParams.get('company');

    let account = null;
    if (accountId) account = findAccountById(accountId);
    else if (phone) account = findAccountByPhone(phone);
    else if (company) account = accounts.find((a) => a.company === company);

    if (!account) {
      return Response.json({ error: 'No matching account' }, { status: 404 });
    }

    const { source, insights } = await getInsightsForAccount(account);
    return Response.json({ accountId: account.id, company: account.company, source, insights });
  } catch (error) {
    console.error('Insights error:', error);
    return Response.json({ error: error.message }, { status: 502 });
  }
}
