'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useTasks } from '@/context/task-context';
import { findAccountByPhone } from '@/data/accounts';
import { CURRENT_REP_ID, currentRep, findTeamMember } from '@/data/team';
import { extractTasksFromTranscript } from '@/lib/extract-tasks';
import { buildHandoff, sendHandoff } from '@/lib/handoffs';
import { resolveDueDate } from '@/lib/due-dates';

const COMPLETED_EVENT = 'zp-call-log-completed-event';
const NOTICE_TIMEOUT_MS = 30000;

const TranscriptTaskWatcher = () => {
  const { tasks, addTasks, removeTask, openTaskForm } = useTasks();
  const [notice, setNotice] = useState(null); // { callId, taskIds }
  const handledCallsRef = useRef(new Set());

  useEffect(() => {
    const handleEvent = async (event) => {
      if (event.data?.type !== COMPLETED_EVENT) return;

      const data = event.data?.data || {};
      const callId = data.callLogId || data.callId || null;
      const dedupeKey = callId || `evt-${Date.now()}`;
      if (handledCallsRef.current.has(dedupeKey)) return;
      handledCallsRef.current.add(dedupeKey);

      const phone = data.caller?.phoneNumber || data.callee?.phoneNumber;
      let transcript = null;
      try {
        const params = new URLSearchParams();
        if (callId) params.set('callId', callId);
        if (phone) params.set('phone', phone);
        const res = await fetch(`/api/transcript?${params.toString()}`);
        if (!res.ok) return;
        transcript = (await res.json()).transcript;
      } catch (err) {
        console.error('Failed to fetch call transcript', err);
        return;
      }
      if (!transcript) return;

      const contact =
        findAccountByPhone(data.caller?.phoneNumber) ||
        findAccountByPhone(data.callee?.phoneNumber);
      const now = new Date();
      const items = extractTasksFromTranscript(transcript).map((item, i) => {
        const owner = findTeamMember(item.ownerId) || currentRep;
        const task = {
          id: `task-${now.getTime()}-${i}`,
          callId,
          contactId: contact?.id || null,
          contactName: contact?.name || data.caller?.name || 'Unknown contact',
          contactEmail: contact?.email || '',
          account: contact?.company || '',
          nextStep: item.nextStep,
          dueAt: (resolveDueDate(item.dueOption) || now).toISOString(),
          createdAt: now.toISOString(),
          completedAt: null,
          source: 'transcript',
          snippet: item.snippet,
          ownerId: owner.id,
          ownerName: owner.name,
          ownerRole: owner.role,
          type: item.type || 'task',
          priority: item.priority || 'normal',
        };
        // Handoffs/escalations go to the owner with a summary + client context.
        if (owner.id !== CURRENT_REP_ID) {
          const handoff = buildHandoff({
            task,
            owner,
            contact,
            call: { callId, direction: data.direction, time: now },
          });
          const notification = sendHandoff(handoff);
          task.handoff = { ...handoff, sentAt: notification.sentAt };
        }
        return task;
      });
      if (!items.length) return;

      addTasks(items);
      setNotice({ callId, taskIds: items.map((task) => task.id) });
    };

    window.addEventListener('message', handleEvent);
    return () => window.removeEventListener('message', handleEvent);
  }, [addTasks]);

  // Auto-dismiss the confirmation after a while.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  // Render live task data so edits/deletes reflect immediately.
  const noticeTasks = tasks.filter((task) => notice.taskIds.includes(task.id));
  if (!noticeTasks.length) return null;

  return (
    <div className="fixed bottom-5 left-[220px] w-96 bg-white shadow-lg rounded-lg border p-4 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-800">
          {noticeTasks.length} follow-up task{noticeTasks.length > 1 ? 's' : ''} created from transcript
        </h3>
        <button
          onClick={() => setNotice(null)}
          className="text-sm text-red-600 hover:underline"
        >
          Dismiss
        </button>
      </div>
      <ul className="text-sm text-gray-700 space-y-3">
        {noticeTasks.map((task) => (
          <li key={task.id} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
            <div className="font-medium">{task.nextStep}</div>
            <div className="text-xs text-gray-500">
              {task.contactName}
              {task.account ? ` · ${task.account}` : ''} · due {format(new Date(task.dueAt), 'EEE, MMM d, h:mm a')}
            </div>
            {task.ownerId && task.ownerId !== CURRENT_REP_ID && (
              <div className={`text-xs mt-0.5 ${task.type === 'escalation' ? 'text-red-600' : 'text-amber-700'}`}>
                {task.type === 'escalation' ? 'Escalated to' : 'Assigned to'} {task.ownerName} ({task.ownerRole})
                {task.handoff?.sentAt ? ' — notified' : ''}
              </div>
            )}
            {task.snippet && (
              <div className="text-xs text-gray-400 italic mt-0.5">“{task.snippet}”</div>
            )}
            <div className="mt-1 flex gap-3">
              <button
                onClick={() =>
                  openTaskForm({ callId: task.callId, accountId: task.contactId, task })
                }
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => removeTask(task.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TranscriptTaskWatcher;
