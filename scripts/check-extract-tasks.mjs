// Quick unit-style check for the transcript task extractor.
// Run: node scripts/check-extract-tasks.mjs

import assert from 'node:assert/strict';
import { extractTasksFromTranscript } from '../src/lib/extract-tasks.js';
import { DUE_OPTIONS, resolveDueDate } from '../src/lib/due-dates.js';
import { findTranscript, transcriptsByCall, transcriptsByPhone } from '../src/data/transcripts.js';
import { CURRENT_REP_ID } from '../src/data/team.js';

const tasks = extractTasksFromTranscript(transcriptsByCall.cl1);
assert.equal(tasks.length, 2, 'cl1 transcript should yield two tasks');
assert.equal(tasks[0].nextStep, 'Send MSA');
assert.equal(tasks[0].dueOption, 'friday');
assert.equal(tasks[1].nextStep, 'Send summary email');
assert.equal(tasks[1].dueOption, '24h');

const janeTasks = extractTasksFromTranscript(transcriptsByPhone['5559876543']);
assert.deepEqual(janeTasks.map((t) => t.nextStep), ['Schedule a demo', 'Send pricing']);
assert.deepEqual(janeTasks.map((t) => t.dueOption), ['monday', 'tomorrow']);

const johnTasks = extractTasksFromTranscript(transcriptsByPhone['5551112233']);
assert.deepEqual(johnTasks.map((t) => t.nextStep), ['Send proposal', 'Send case study', 'Schedule follow-up call']);

// Every extracted dueOption must resolve to a real date.
for (const task of [...tasks, ...janeTasks, ...johnTasks]) {
  assert.ok(task.dueOption in DUE_OPTIONS, `unknown dueOption ${task.dueOption}`);
  assert.ok(resolveDueDate(task.dueOption) instanceof Date);
}

// Transcript lookup: callId wins, then phone digits.
assert.ok(findTranscript({ callId: 'c1' }));
assert.ok(findTranscript({ phoneNumber: '+1 (555) 123-4567' }));
assert.equal(findTranscript({ callId: 'nope', phoneNumber: '999' }), null);
assert.equal(findTranscript(), null);

// No action phrases => no tasks.
assert.equal(extractTasksFromTranscript('Just a friendly catch-up, no commitments.').length, 0);

// Owner detection: default owner is the rep.
assert.ok(
  tasks.every((t) => t.ownerId === CURRENT_REP_ID && t.type === 'task' && t.priority === 'normal'),
  'rep-owned tasks should default to task/normal'
);

// Handoffs: delegated owners get type 'handoff'.
const handoffTasks = extractTasksFromTranscript(transcriptsByCall.cl2);
assert.deepEqual(
  handoffTasks.map((t) => t.nextStep),
  ['Send MSA', 'Approve discount', 'Send summary email']
);
assert.deepEqual(
  handoffTasks.map((t) => t.ownerId),
  ['legal-priya', 'mgr-sam', CURRENT_REP_ID]
);
assert.deepEqual(
  handoffTasks.map((t) => t.type),
  ['handoff', 'handoff', 'task']
);
assert.equal(handoffTasks[0].dueOption, 'friday');

// Escalation: one high-priority task owned by the escalation target.
const escalationTasks = extractTasksFromTranscript(transcriptsByCall.c3);
assert.deepEqual(
  escalationTasks.map((t) => t.nextStep),
  ['Escalate duplicate charge', 'Send summary email']
);
assert.equal(escalationTasks[0].ownerId, 'billing-maria');
assert.equal(escalationTasks[0].type, 'escalation');
assert.equal(escalationTasks[0].priority, 'high');
assert.equal(escalationTasks[0].dueOption, '24h');

// Escalation with no named target defaults to the rep's manager.
const managerEscalation = extractTasksFromTranscript('I need to escalate this to a manager.')[0];
assert.equal(managerEscalation.ownerId, 'mgr-sam');
assert.equal(managerEscalation.type, 'escalation');
assert.equal(managerEscalation.nextStep, 'Escalate issue');

// Named owner without an explicit delegation verb.
const named = extractTasksFromTranscript('Priya will send over the redlined MSA by Friday.')[0];
assert.equal(named.ownerId, 'legal-priya');
assert.equal(named.type, 'handoff');

console.log('extract-tasks checks passed');
