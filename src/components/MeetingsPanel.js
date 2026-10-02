'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, formatDistance, isPast } from 'date-fns';
import { findAccountById } from '@/data/accounts';
import { getMeetings } from '@/data/meetings';
import { getSalesforceContext } from '@/data/salesforce';
import { suggestNextStep } from '@/lib/next-step';
import { resolveDueDate } from '@/lib/due-dates';
import { useTasks } from '@/context/task-context';

const STAGE_STYLES = {
  Prospecting: 'bg-gray-100 text-gray-700',
  Discovery: 'bg-sky-100 text-sky-700',
  Proposal: 'bg-indigo-100 text-indigo-700',
  Negotiation: 'bg-amber-100 text-amber-800',
  'Closed Won': 'bg-green-100 text-green-700',
  'Closed Lost': 'bg-red-100 text-red-700',
};

const FLAG_LABELS = { pricingSent: 'Pricing sent', msaSent: 'MSA sent', msaSigned: 'MSA signed' };

const Flag = ({ label, on }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs border ${
      on ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'
    }`}
  >
    {on ? '✓' : '✗'} {label}
  </span>
);

const SalesforceCard = ({ context, now }) => {
  if (!context) {
    return <div className="text-sm text-gray-500">No Salesforce record for this contact.</div>;
  }
  const { opportunity, lastActivity, openCases, flags } = context;
  const closeDate = new Date(opportunity.closeDate);
  return (
    <div className="border border-sky-200 rounded-lg bg-sky-50/40 p-3 text-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">Salesforce</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_STYLES[opportunity.stage]}`}>
          {opportunity.stage}
        </span>
      </div>
      <div className="font-medium text-gray-800">{opportunity.name}</div>
      <div className="grid grid-cols-3 gap-2 text-gray-700">
        <div>
          <div className="text-xs text-gray-500">Amount</div>
          <div>${opportunity.amount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Close date</div>
          <div>{format(closeDate, 'MMM d, yyyy')}</div>
          <div className="text-xs text-gray-500">in {formatDistance(closeDate, now)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Owner</div>
          <div>{opportunity.owner}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(FLAG_LABELS).map(([key, label]) => (
          <Flag key={key} label={label} on={flags[key]} />
        ))}
      </div>
      <div className="text-xs text-gray-600">
        Last activity: {lastActivity.type} – {lastActivity.subject} ({formatDistance(new Date(lastActivity.date), now)} ago)
      </div>
      <div className="text-xs text-gray-600">
        Open cases:{' '}
        {openCases.length === 0
          ? 'none'
          : openCases.map((c) => (
              <span key={c.id} className={`mr-2 ${c.priority === 'High' ? 'text-red-600 font-medium' : ''}`}>
                #{c.id} {c.subject} ({c.priority})
              </span>
            ))}
      </div>
    </div>
  );
};

const MeetingRow = ({ meeting, now }) => {
  const { tasks, addTask } = useTasks();
  const contact = findAccountById(meeting.contactId);
  const context = getSalesforceContext(meeting.contactId, now);
  const suggestion = suggestNextStep(context, now);
  const start = new Date(meeting.startAt);
  const recent = isPast(start);
  const added = tasks.some((task) => task.meetingId === meeting.id && task.nextStep === suggestion.label);

  const handleAdd = () => {
    const createdAt = new Date();
    addTask({
      id: `task-${createdAt.getTime()}`,
      callId: null,
      meetingId: meeting.id,
      contactId: contact.id,
      contactName: contact.name,
      contactEmail: contact.email,
      account: contact.company,
      nextStep: suggestion.label,
      dueAt: resolveDueDate(suggestion.due, null, createdAt).toISOString(),
      createdAt: createdAt.toISOString(),
      completedAt: null,
    });
  };

  return (
    <li className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-[220px_1fr] gap-4">
        <div className="text-sm space-y-1">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              recent ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {recent ? 'Recent' : 'Upcoming'}
          </span>
          <div className="font-semibold text-gray-800">{meeting.title}</div>
          <div className="text-gray-600">{format(start, 'EEE, MMM d · h:mm a')}</div>
          <div className="text-xs text-gray-500">
            {meeting.durationMin} min · {recent ? `${formatDistance(start, now)} ago` : `in ${formatDistance(start, now)}`}
          </div>
          <div className="pt-1">
            <div className="text-gray-800">{contact.name}</div>
            <div className="text-xs text-gray-500">{contact.description} · {contact.company}</div>
          </div>
        </div>
        <SalesforceCard context={context} now={now} />
      </div>
      <div className="flex items-center justify-between gap-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Suggested next step</div>
          <div className="font-medium text-gray-800">{suggestion.label}</div>
          <div className="text-xs text-gray-600">{suggestion.reason}</div>
        </div>
        {added ? (
          <Link href="/tasks" className="shrink-0 text-sm text-green-700 hover:underline">
            ✓ Added to tasks
          </Link>
        ) : (
          <button
            onClick={handleAdd}
            className="shrink-0 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add as task
          </button>
        )}
      </div>
    </li>
  );
};

const MeetingsPanel = () => {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 min-w-0">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming / Recent Meetings</h2>
      {now ? (
        <ul className="space-y-4">
          {getMeetings(now).map((meeting) => (
            <MeetingRow key={meeting.id} meeting={meeting} now={now} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Loading meetings…</p>
      )}
    </div>
  );
};

export default MeetingsPanel;
