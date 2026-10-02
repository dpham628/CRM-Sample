'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { accounts, findAccountById } from '@/data/accounts';
import { DUE_OPTIONS, resolveDueDate } from '@/lib/due-dates';

const SUGGESTED_STEPS = [
  { label: 'Send MSA', due: 'friday' },
  { label: 'Send summary email', due: '24h' },
];

const PostCallTaskModal = ({ call, onClose, onSave }) => {
  const editing = call.task || null;
  const [accountId, setAccountId] = useState(call.accountId || editing?.contactId || '');
  const [nextStep, setNextStep] = useState(editing?.nextStep || '');
  const [dueOption, setDueOption] = useState(editing ? 'custom' : '24h');
  const [customDate, setCustomDate] = useState(
    editing ? format(new Date(editing.dueAt), 'yyyy-MM-dd') : ''
  );
  const [error, setError] = useState(null);

  const account = findAccountById(accountId);
  const due = resolveDueDate(dueOption, customDate);

  const applySuggestion = ({ label, due: suggestedDue }) => {
    setNextStep(label);
    setDueOption(suggestedDue);
  };

  const handleSave = () => {
    if (!account) {
      setError('Select the contact the call was with.');
      return;
    }
    if (!nextStep.trim()) {
      setError('Describe the next step.');
      return;
    }
    const dueAt = resolveDueDate(dueOption, customDate);
    if (!dueAt) {
      setError('Pick a due date.');
      return;
    }
    const now = new Date();
    const base = editing || {
      id: `task-${now.getTime()}`,
      callId: call.callId || null,
      createdAt: now.toISOString(),
      completedAt: null,
    };
    onSave({
      ...base,
      contactId: account.id,
      contactName: account.name,
      contactEmail: account.email,
      account: account.company,
      nextStep: nextStep.trim(),
      dueAt: dueAt.toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-labelledby="post-call-task-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <h3 id="post-call-task-title" className="text-lg font-semibold text-gray-800">
              {editing ? 'Edit follow-up task' : 'Create follow-up task'}
            </h3>
            {call.callId && <p className="text-xs text-gray-500">After call {call.callId}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 text-sm">
          <label className="block">
            <span className="font-medium text-gray-700">Contact</span>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-2 py-2"
            >
              <option value="">Select contact…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>

          <div>
            <span className="font-medium text-gray-700">Account</span>
            <p className="mt-1 py-2 px-2 bg-gray-50 border border-gray-200 rounded text-gray-800">
              {account ? account.company : '—'}
            </p>
          </div>

          <label className="block">
            <span className="font-medium text-gray-700">Next step</span>
            <input
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="e.g. Send MSA"
              className="mt-1 w-full border border-gray-300 rounded px-2 py-2"
            />
          </label>
          <div className="flex gap-2">
            {SUGGESTED_STEPS.map((step) => (
              <button
                key={step.label}
                type="button"
                onClick={() => applySuggestion(step)}
                className="px-2 py-1 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {step.label} · {DUE_OPTIONS[step.due].toLowerCase()}
              </button>
            ))}
          </div>

          <div>
            <span className="font-medium text-gray-700">Due</span>
            <div className="mt-1 flex items-center gap-2">
              <select
                aria-label="Due"
                value={dueOption}
                onChange={(e) => setDueOption(e.target.value)}
                className="border border-gray-300 rounded px-2 py-2"
              >
                {Object.entries(DUE_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {dueOption === 'custom' && (
                <input
                  type="date"
                  aria-label="Due date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-2"
                />
              )}
              {due && <span className="text-gray-500">{format(due, 'EEE, MMM d, h:mm a')}</span>}
            </div>
          </div>

          {error && <p className="text-red-600">{error}</p>}
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Save task
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCallTaskModal;
