import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  let from = searchParams.get("from");
  let to = searchParams.get("to");

  if (!from || !to) {
    const now = new Date();
    to = now.toISOString().split("T")[0]; // today
    from = new Date(now.setDate(now.getDate() - 30)).toISOString().split("T")[0]; // 30 days ago
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }
  
    let zoomUrl = 'https://api.zoom.us/v2/phone/call_history'
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (params.toString()) zoomUrl += `?${params.toString()}`

    const response = await fetch(zoomUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errText = await response.text();
      console.error(`Zoom API error: ${response.status}`, errText);
      throw new Error(`Zoom API error: ${response.status} - ${errText}`);
    }

    const data = await response.json()
  
    const formatted = data.call_logs.map(log => ({
      id: log.id,
      direction: log.direction,
      connect_type: log.connect_type,
      start_time: log.start_time,
      end_time: log.end_time,
      duration: log.duration,
      recording_status: log.recording_status
    }))

    return Response.json({ interactions: formatted })
  } catch (err) {
    console.error('Zoom call logs fetch error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}