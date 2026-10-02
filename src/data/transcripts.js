// Mock call transcripts for the demo. In production these come from the
// Zoom Phone transcript API — see src/app/api/transcript/route.js.

const lastTenDigits = (phoneNumber) => String(phoneNumber).replace(/\D/g, '').slice(-10);

// Keyed by Zoom callId / callLogId from zp-call-log-completed-event.
export const transcriptsByCall = {
  c1: "Thanks for walking me through the renewal today. I'll send over the MSA, can you get it back to me by Friday? I'll also send you a summary email within 24 hours so your team has all the details.",
  cl1: "Thanks for walking me through the renewal today. I'll send over the MSA, can you get it back to me by Friday? I'll also send you a summary email within 24 hours so your team has all the details.",
  // Handoffs: Legal owns the redlined MSA, the rep's manager owns the approval.
  c2: "Great, we're aligned on the renewal terms. I'll have Priya from Legal send over the redlined MSA by Friday. Let me loop in my manager to approve the discount we talked about. I'll also send you a summary email within 24 hours.",
  cl2: "Great, we're aligned on the renewal terms. I'll have Priya from Legal send over the redlined MSA by Friday. Let me loop in my manager to approve the discount we talked about. I'll also send you a summary email within 24 hours.",
  // Escalation: customer-service call about a duplicate charge (Jane Doe, Globex).
  c3: "I completely understand the frustration about the duplicate charge on your September invoice. I'm going to escalate this to our billing manager — they'll reach out within 24 hours about the duplicate charge and process your refund. I'll also send you a summary email within 24 hours.",
  cl3: "I completely understand the frustration about the duplicate charge on your September invoice. I'm going to escalate this to our billing manager — they'll reach out within 24 hours about the duplicate charge and process your refund. I'll also send you a summary email within 24 hours.",
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
