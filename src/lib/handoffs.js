// Handoff payloads + simulated delivery for tasks owned by someone other
// than the rep. `sendHandoff` is the swap point for a real email/Slack
// integration later; today it appends to a mock outbox in localStorage.

import { format } from 'date-fns';
import { findOrdersByAccount } from '../data/orders.js';

export const OUTBOX_KEY = 'crm.outbox';

const money = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// Deterministic handoff payload: the action item + due date, a light call
// summary (contact, account, call time/direction, transcript snippet), and
// client context (contact/account + recent orders). No LLM involved.
export const buildHandoff = ({ task, owner, contact, call = {} }) => {
  const account = task.account || contact?.company || '';
  const orders = findOrdersByAccount(account);
  const when = call.time
    ? `${call.direction ? `${call.direction} call` : 'call'} on ${format(new Date(call.time), 'EEE, MMM d, h:mm a')}`
    : 'recent call';
  const contactName = task.contactName || contact?.name || 'the contact';

  const summary = [
    `${contactName}${account ? ` (${account})` : ''} — ${when}.`,
    task.snippet ? `“${task.snippet}”` : null,
  ]
    .filter(Boolean)
    .join(' ');

  // Escalation nextSteps already start with "Escalate", so don't repeat it.
  const subject = `${task.type === 'escalation' ? 'Escalation' : 'Follow-up'}: ${task.nextStep.replace(/^Escalate /, '')}${account ? ` — ${account}` : ''}`;

  const body = [
    `Hi ${owner.name.split(' ')[0]},`,
    '',
    `This follow-up is on your plate after the ${when} with ${contactName}${account ? ` (${account})` : ''}:`,
    '',
    `• Action: ${task.nextStep}`,
    `• Due: ${format(new Date(task.dueAt), 'EEE, MMM d, h:mm a')}`,
    task.snippet ? `• From the call: “${task.snippet}”` : null,
    '',
    'Client context:',
    `• Contact: ${contactName}${task.contactEmail ? ` (${task.contactEmail})` : ''}`,
    account ? `• Account: ${account}` : null,
    ...orders.map(
      (o) =>
        `• ${o.orderNumber}: ${o.product} — ${money(o.amount)} (${format(new Date(o.orderedAt), 'MMM d, yyyy')}, ${o.status})`
    ),
  ]
    .filter(Boolean)
    .join('\n');

  return {
    taskId: task.id,
    ownerId: owner.id,
    recipientName: owner.name,
    recipientRole: owner.role,
    recipientDepartment: owner.department,
    recipientEmail: owner.email,
    subject,
    summary,
    orders,
    body,
  };
};

// Simulated delivery — replace with a real email/Slack call later.
export const sendHandoff = (handoff) => {
  const notification = {
    id: `notif-${Date.now()}`,
    channel: 'email',
    sentAt: new Date().toISOString(),
    ...handoff,
  };
  try {
    const stored = window.localStorage.getItem(OUTBOX_KEY);
    const outbox = stored ? JSON.parse(stored) : [];
    outbox.unshift(notification);
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
  } catch (err) {
    console.error('Failed to record handoff notification', err);
  }
  return notification;
};

export const readOutbox = () => {
  try {
    return JSON.parse(window.localStorage.getItem(OUTBOX_KEY)) || [];
  } catch {
    return [];
  }
};
