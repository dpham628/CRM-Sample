"use client";

import React, { useState, useEffect } from "react";
import EventModal from "./EventModal";  // Import the EventModal component

const EventLog = () => {
  const [logs, setLogs] = useState([]);

  // Define valid event types directly inside the component
  const validEventTypes = [
    "zp-call-ringing-event",
    "zp-call-log-completed-event",
  ];

  // Function to check if the event type is valid
  const isValidEventType = (eventType) => {
    return validEventTypes.includes(eventType);
  };

  useEffect(() => {
    const handleEvent = (event) => {
      const eventType = event.data?.type;

      // Use the internal isValidEventType function to filter event types
      if (isValidEventType(eventType)) {
        setLogs((prevLogs) => [
          ...prevLogs,
          {
            eventType,
            data: event.data,
            id: Date.now(), // Add a unique id for each log
          },
        ]);
      } else {
        console.log(`Ignored event type: ${eventType}`); // Log ignored event types
      }
    };

    // Add event listener to capture events (assuming events are posted to window)
    window.addEventListener("message", handleEvent);
    
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener("message", handleEvent);
  }, []);

  // Function to close modal by removing log from state
  const closeModal = (id) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
  };

  return (
    <div className="event-stack">
      {logs.map((log, index) => (
        <EventModal key={log.id} log={log} index={index} onClose={closeModal} />
      ))}
    </div>
  );
};

export default EventLog;
