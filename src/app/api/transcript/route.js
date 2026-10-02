import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { findTranscript } from "@/data/transcripts";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const callId = searchParams.get("callId");
  const phoneNumber = searchParams.get("phone");

  const session = await getServerSession(authOptions);

  // TODO: when Zoom Phone transcription is enabled, use session.accessToken to
  // fetch the real transcript (e.g. GET /v2/phone/call_logs/{callId} and its
  // recording transcript). Until then — and whenever unauthenticated — fall
  // back to the mock transcripts in src/data/transcripts.js.
  const transcript = findTranscript({ callId, phoneNumber });

  return Response.json({
    transcript,
    source: session?.accessToken ? "mock-fallback" : "mock",
  });
}
