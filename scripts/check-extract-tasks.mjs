// Quick unit-style check for the transcript task extractor.
// Run: node scripts/check-extract-tasks.mjs

import assert from 'node:assert/strict';
import { extractTasksFromTranscript } from '../src/lib/extract-tasks.js';
import { DUE_OPTIONS, resolveDueDate } from '../src/lib/due-dates.js';
import { findTranscript, transcriptsByCall, transcriptsByPhone } from '../src/data/transcripts.js';

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

console.log('extract-tasks checks passed');
