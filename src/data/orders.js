// Mock recent orders/invoices per account, attached to handoffs as client
// context. Keyed by company name from src/data/accounts.js.
export const ordersByAccount = {
  'Acme Corp': [
    {
      orderNumber: 'ORD-1042',
      product: 'Pro Plan — Annual',
      amount: 4800,
      orderedAt: '2026-09-12',
      status: 'Active',
    },
  ],
  Globex: [
    {
      orderNumber: 'INV-2209',
      product: 'Team Plan — Monthly',
      amount: 149.0,
      orderedAt: '2026-09-01',
      status: 'Paid',
    },
    // Same product/amount billed twice — this is the duplicate charge Jane calls about.
    {
      orderNumber: 'INV-2210',
      product: 'Team Plan — Monthly',
      amount: 149.0,
      orderedAt: '2026-09-01',
      status: 'Duplicate charge',
    },
  ],
  Initech: [
    {
      orderNumber: 'ORD-0987',
      product: 'Starter Plan — Annual',
      amount: 1200,
      orderedAt: '2026-08-20',
      status: 'Active',
    },
  ],
};

export const findOrdersByAccount = (company) => ordersByAccount[company] || [];
