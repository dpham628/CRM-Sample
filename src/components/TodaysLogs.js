"use client"
import React, {useState, useEffect} from "react";

const Calls = () => {
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const todaysLogs = [
    {
      id: 1,
      agent_name: "John Doe",
      queue_name: "Support",
      start_time: new Date(now).toISOString(),
      end_time: new Date(now + 600000).toISOString(), // +10 minutes
      duration: 600,
      recording_url: "https://example.com/recording1.mp3"
    },
    {
      id: 2,
      agent_name: "Jane Smith",
      queue_name: "Sales",
      start_time: new Date(now).toISOString(),
      end_time: new Date(now + 300000).toISOString(), // +5 minutes
      duration: 300,
      recording_url: ""
    }
  ];

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 min-w-0">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Daily Call Logs</h2>
      <table className="text-sm text-left text-gray-600">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Agent</th>
            <th className="px-4 py-2">Queue</th>
            <th className="px-4 py-2">Start Time</th>
            <th className="px-4 py-2">End Time</th>
            <th className="px-4 py-2">Duration</th>
            <th className="px-4 py-2">Recording</th>
          </tr>
        </thead>
        <tbody>
          {todaysLogs.map((log) => (
            <tr key={log.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{log.agent_name}</td>
              <td className="px-4 py-2">{log.queue_name}</td>
              <td className="px-4 py-2">{now ? new Date(log.start_time).toLocaleString() : ''}</td>
              <td className="px-4 py-2">{now ? new Date(log.end_time).toLocaleString() : ''}</td>
              <td className="px-4 py-2">{Math.floor(log.duration / 60)} min</td>
              <td className="px-4 py-2"> 
                {log.recording_url ? (
                  <a
                    href={log.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Listen
                  </a>
                ) : ('N/A')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calls;
