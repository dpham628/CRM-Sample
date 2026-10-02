// Mock call transcripts for the demo. In production these come from the
// Zoom Phone transcript API — see src/app/api/transcript/route.js.

const lastTenDigits = (phoneNumber) => String(phoneNumber).replace(/\D/g, '').slice(-10);

// Keyed by Zoom callId / callLogId from zp-call-log-completed-event.
export const transcriptsByCall = {
  c1: "Thanks for walking me through the renewal today. I'll send over the MSA, can you get it back to me by Friday? I'll also send you a summary email within 24 hours so your team has all the details.",
  cl1: "Thanks for walking me through the renewal today. I'll send over the MSA, can you get it back to me by Friday? I'll also send you a summary email within 24 hours so your team has all the details.",
};

// Keyed by contact phone number so any completed call to a known contact
// produces a transcript in mock mode.
export const transcriptsByPhone = {
  // Rehema Armorer — Acme Corp
  '5551234567': "Thanks for walking me through the renewal today. I'll send over the MSA, can you get it back to me by Friday? I'll also send you a summary email within 24 hours so your team has all the details.",
  // Jane Doe — Globex
  '5559876543': "Great catching up. Can you set up a demo for the wider team next Monday? And I'll send over the pricing sheet tomorrow morning.",
  // John Smith — Initech
  '5551112233': "I'll send the proposal and a case study by end of week. Let's schedule a follow-up call next Monday to talk through next steps.",
};

export const findTranscript = ({ callId, phoneNumber } = {}) => {
  if (callId && transcriptsByCall[callId]) return transcriptsByCall[callId];
  if (phoneNumber) {
    const digits = lastTenDigits(phoneNumber);
    if (transcriptsByPhone[digits]) return transcriptsByPhone[digits];
  }
  return null;
};
