import { addDays } from 'date-fns';

// Mock Salesforce records keyed by contact id from src/data/accounts.js.
// Dates are stored as day offsets so the demo stays current.
const records = {
  '1': {
    opportunity: {
      id: '006A000001AcmeX',
      name: 'Acme Corp – Platform Expansion',
      stage: 'Negotiation',
      amount: 120000,
      closeInDays: 9,
      owner: 'Alex Rivera',
    },
    lastActivity: { type: 'Email', subject: 'Redlines on order form', daysAgo: 2 },
    openCases: [],
    flags: { pricingSent: true, msaSent: true, msaSigned: false },
  },
  '2': {
    opportunity: {
      id: '006A000002GlobR',
      name: 'Globex – Support Renewal FY27',
      stage: 'Proposal',
      amount: 48000,
      closeInDays: 21,
      owner: 'Alex Rivera',
    },
    lastActivity: { type: 'Call', subject: 'Renewal check-in', daysAgo: 6 },
    openCases: [
      { id: '00012345', subject: 'SSO login failures for EU users', priority: 'High' },
      { id: '00012351', subject: 'Invoice address update', priority: 'Low' },
    ],
    flags: { pricingSent: true, msaSent: false, msaSigned: false },
  },
  '3': {
    opportunity: {
      id: '006A000003InitD',
      name: 'Initech – Contact Center Pilot',
      stage: 'Discovery',
      amount: 65000,
      closeInDays: 60,
      owner: 'Sam Chen',
    },
    lastActivity: { type: 'Meeting', subject: 'Intro call', daysAgo: 12 },
    openCases: [],
    flags: { pricingSent: false, msaSent: false, msaSigned: false },
  },
};

// Swap point for a real Salesforce integration.
export const getSalesforceContext = (contactId, now = new Date()) => {
  const record = records[contactId];
  if (!record) return null;
  const { closeInDays, ...opportunity } = record.opportunity;
  const { daysAgo, ...lastActivity } = record.lastActivity;
  return {
    opportunity: { ...opportunity, closeDate: addDays(now, closeInDays).toISOString() },
    lastActivity: { ...lastActivity, date: addDays(now, -daysAgo).toISOString() },
    openCases: record.openCases,
    flags: record.flags,
  };
};
