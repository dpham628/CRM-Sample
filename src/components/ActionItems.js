'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { findAccountById } from '@/data/accounts';
import { meetingSummaries } from '@/data/meeting-summaries';
import { extractActionItems } from '@/lib/action-items';
import { DUE_OPTIONS, resolveDueDate } from '@/lib/due-dates';
import { useTasks } from '@/context/task-context';

const taskIdFor = (summary, item) => `ai-${summary.id}-${item.id}`;

const buildTask = (summary, item, account, completed) => {
  const now = new Date();
  return {
    id: taskIdFor(summary, item),
    callId: summary.callId,
    contactId: account.id,
    contactName: account.name,
    contactEmail: account.email,
    account: account.company,
    nextStep: item.action,
    dueAt: resolveDueDate(item.due, null, now).toISOString(),
    createdAt: now.toISOString(),
    completedAt: completed ? now.toISOString() : null,
  };
};

const SummaryCard = ({ summary, tasks, addTask, toggleTask }) => {
  const [expanded, setExpanded] = useState(false);
  const account = findAccountById(summary.accountId);
  const items = extractActionItems(summary.summary);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-gray-800">{summary.title}</h3>
          <p className="text-xs text-gray-500">
            {summary.source} · {summary.when} · {account.name}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">
          AI Companion summary
        </span>
      </div>

      <p className={`mt-2 text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>{summary.summary}</p>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="text-xs text-blue-600 hover:underline"
      >
        {expanded ? 'Hide full summary' : 'Show full summary'}
      </button>

      <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
        {items.length === 0 && <li className="py-2 text-sm text-gray-500">No action items found.</li>}
        {items.map((item) => {
          const task = tasks.find((t) => t.id === taskIdFor(summary, item));
          const done = !!task?.completedAt;
          return (
            <li key={item.id} className="py-2 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                aria-label={`Mark "${item.action}" done`}
                checked={done}
                onChange={() => (task ? toggleTask(task.id) : addTask(buildTask(summary, item, account, true)))}
              />
              <div className="flex-1 min-w-0">
                <div className={done ? 'line-through text-gray-400' : 'text-gray-800'}>
                  {account.name} · {account.company} · <span className="font-medium">{item.action}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {task ? `Due ${format(new Date(task.dueAt), 'EEE, MMM d, h:mm a')}` : DUE_OPTIONS[item.due]}
                </div>
              </div>
              {task ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                  {done ? 'Done' : 'Added to Tasks'}
                </span>
              ) : (
                <button
                  onClick={() => addTask(buildTask(summary, item, account, false))}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Add to Tasks
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ActionItems = () => {
  const { tasks, addTask, toggleTask } = useTasks();

  return (
    <div className="bg-white rounded-2xl shadow p-6 min-w-0 w-full">
      <h2 className="text-xl font-semibold text-gray-800">Action Items</h2>
      <p className="text-xs text-gray-500 mb-4">Immediate next steps from recent Zoom call and meeting summaries</p>
      <div className="space-y-4">
        {meetingSummaries.map((summary) => (
          <SummaryCard key={summary.id} summary={summary} tasks={tasks} addTask={addTask} toggleTask={toggleTask} />
        ))}
      </div>
    </div>
  );
};

export default ActionItems;
