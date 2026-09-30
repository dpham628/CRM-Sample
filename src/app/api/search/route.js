import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  // Get the session which contains the access token
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  // Check if there was an error refreshing the token
  if (session.error === "RefreshAccessTokenError") {
    return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }
  
  const {searchParams} = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return Response.json({ error: "Search query is required" }, { status: 400 });
  }
  
  try {
    // Use the access token to call Zoom API
    const response = await fetch('https://api.zoom.us/v2/phone/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Token might still be invalid despite refresh attempt
        return Response.json({ error: "API authorization failed. Please sign in again." }, { status: 401 });
      }
      
      const errText = await response.text();
      console.error(`Zoom API error: ${response.status}`, errText);
      throw new Error(`Zoom API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
     // Filter users based on the search query
     const filteredUsers = data.users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );

 
    const results = filteredUsers.map(user => ({
      name: `${user.name}`,
      phone_number: user.phone_numbers?.[0]?.number || null,
      // Add other fields as needed
    }));
    return Response.json({contacts: results});
  } catch (err) {
    console.error('Search error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}