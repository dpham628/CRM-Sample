'use client';

import React, { useState } from 'react';
import { addHours, format, isFriday, nextFriday, setHours, startOfHour } from 'date-fns';
import { accounts, findAccountById } from '@/data/accounts';

export const ACTION_TYPES = {
  send_msa: { label: 'Send MSA', defaultDue: 'friday' },
  follow_up_email: { label: 'Send follow-up email', defaultDue: '24h' },
  custom: { label: 'Custom task', defaultDue: 'custom' },
};

const endOfBusinessFriday = (now) => {
  const friday = isFriday(now) && now.getHours() < 17 ? now : nextFriday(now);
  return startOfHour(setHours(friday, 17));
};

export const resolveDueDate = (dueOption, customDue, now = new Date()) => {
  if (dueOption === '24h') return addHours(now, 24);
  if (dueOption === 'friday') return endOfBusinessFriday(now);
  return customDue ? new Date(customDue) : null;
};

const defaultTitle = (type, account) => {
  const who = account ? `${account.name} (${account.company})` : 'contact';
  if (type === 'send_msa') return `Send MSA to ${who}`;
  if (type === 'follow_up_email') return `Send follow-up email to ${who}`;
  return '';
};

let nextKey = 0;
const newItem = (type) => ({
  key: nextKey++,
  type,
  title: '',
  dueOption: ACTION_TYPES[type].defaultDue,
  customDue: '',
});

const PostCallWorkflowModal = ({ call, onClose, onSave }) => {
  const [accountId, setAccountId] = useState(call.accountId || '');
  const [summary, setSummary] = useState('');
  const [items, setItems] = useState([newItem('send_msa')]);
  const [error, setError] = useState(null);

  const account = findAccountById(accountId);

  const updateItem = (key, changes) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  };

  const handleTypeChange = (key, type) => {
    updateItem(key, { type, dueOption: ACTION_TYPES[type].defaultDue });
  };

  const handleSave = () => {
    if (!account) {
      setError('Select the account/contact the call was held with.');
      return;
    }
    if (items.length === 0) {
      setError('Add at least one action item.');
      return;
    }
    const now = new Date();
    const resolved = [];
    for (const item of items) {
      const title = item.title.trim() || defaultTitle(item.type, account);
      const due = resolveDueDate(item.dueOption, item.customDue, now);
      if (!title) {
        setError('Every custom task needs a description.');
        return;
      }
      if (!due || Number.isNaN(due.getTime())) {
        setError(`Pick a due date for "${title}".`);
        return;
      }
      resolved.push({
        id: `${now.getTime()}-${item.key}`,
        type: item.type,
        title,
        dueAt: due.toISOString(),
        callId: call.callId || null,
        accountId: account.id,
        contactName: account.name,
        contactEmail: account.email,
        company: account.company,
        callSummary: summary.trim(),
        createdAt: now.toISOString(),
        completedAt: null,
      });
    }
    onSave(resolved);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-labelledby="post-call-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <h3 id="post-call-title" className="text-lg font-semibold text-gray-800">Post-call workflow</h3>
            {call.callId && <p className="text-xs text-gray-500">Call {call.callId}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-grow space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="font-medium text-gray-700">Call held with</span>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-2 py-2"
              >
                <option value="">Select contact…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} · {a.company}</option>
                ))}
              </select>
            </label>
            <div>
              <span className="font-medium text-gray-700">Account</span>
              <p className="mt-1 py-2 text-gray-800">
                {account ? `${account.company} — ${account.email}` : '—'}
              </p>
            </div>
          </div>

          <label className="block">
            <span className="font-medium text-gray-700">Call summary</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="What was discussed, decisions made…"
              className="mt-1 w-full border border-gray-300 rounded px-2 py-2"
            />
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Action items</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setItems((prev) => [...prev, newItem('send_msa')])}
                  className="text-blue-600 hover:underline"
                >
                  + Send MSA
                </button>
                <button
                  type="button"
                  onClick={() => setItems((prev) => [...prev, newItem('follow_up_email')])}
                  className="text-blue-600 hover:underline"
                >
                  + Follow-up email
                </button>
                <button
                  type="button"
                  onClick={() => setItems((prev) => [...prev, newItem('custom')])}
                  className="text-blue-600 hover:underline"
                >
                  + Custom
                </button>
              </div>
            </div>

            {items.length === 0 && <p className="text-gray-500">No action items yet.</p>}

            <ul className="space-y-3">
              {items.map((item) => {
                const due = resolveDueDate(item.dueOption, item.customDue);
                return (
                  <li key={item.key} className="border border-gray-200 rounded p-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        aria-label="Action type"
                        value={item.type}
                        onChange={(e) => handleTypeChange(item.key, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        {Object.entries(ACTION_TYPES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <input
                        aria-label="Action description"
                        value={item.title}
                        onChange={(e) => updateItem(item.key, { title: e.target.value })}
                        placeholder={defaultTitle(item.type, account) || 'Describe the task'}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((i) => i.key !== item.key))}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Due</span>
                      <select
                        aria-label="Due"
                        value={item.dueOption}
                        onChange={(e) => updateItem(item.key, { dueOption: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="24h">Within 24 hours</option>
                        <option value="friday">By Friday (5 PM)</option>
                        <option value="custom">Pick date…</option>
                      </select>
                      {item.dueOption === 'custom' && (
                        <input
                          type="datetime-local"
                          aria-label="Custom due date"
                          value={item.customDue}
                          onChange={(e) => updateItem(item.key, { customDue: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1"
                        />
                      )}
                      {due && !Number.isNaN(due.getTime()) && (
                        <span className="text-gray-500">{format(due, 'EEE, MMM d, h:mm a')}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {error && <p className="text-red-600">{error}</p>}
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Save action items
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCallWorkflowModal;
