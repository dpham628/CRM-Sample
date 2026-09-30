import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request, { params }) {
  // Await the params object to get the id
  const { id: callId } = await params;
  try {     
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    const zoomUrl = `https://api.zoom.us/v2/phone/call_history/${callId}`
    const response = await fetch(zoomUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Zoom API error: ${response.status} ${errText}`);
      throw new Error(`Zoom API error: ${response.status} - ${errText}`);
    }
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Authorization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}