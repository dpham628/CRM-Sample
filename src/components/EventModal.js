"use client";

import React from "react";
import { useTasks } from "@/context/task-context";
import { findAccountByPhone } from "@/data/accounts";

const EventModal = ({ log, index, onClose }) => {
  const { openTaskForm } = useTasks();
  if (!log) return null;

  const { eventType, data } = log;
  const callId = data?.data?.callId || "N/A";
  const callLogId = data?.data?.callLogId || "N/A";
  const direction = data?.data?.direction || "N/A";
  const caller = data?.data?.caller?.name || "Unknown";
  const contact =
    findAccountByPhone(data?.data?.caller?.phoneNumber) ||
    findAccountByPhone(data?.data?.callee?.phoneNumber);

  const createTask = () => {
    openTaskForm({ callId: callLogId !== "N/A" ? callLogId : callId, accountId: contact?.id });
    onClose(log.id);
  };

  return (
    <div
      className="absolute left-5 w-80 bg-white shadow-lg rounded-lg border p-4 z-50"
      style={{ top: `${10 + index * 120}px` }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-800">Zoom Phone Event</h3>
        <button
          onClick={() => onClose(log.id)}
          className="text-sm text-red-600 hover:underline"
        >
          Close
        </button>
      </div>
      <ul className="text-sm text-gray-700 space-y-1">
        <li><strong>Event:</strong> {eventType}</li>
        <li><strong>Call ID:</strong> {callId}</li>
        <li><strong>Call log ID:</strong> {callLogId}</li>
        <li><strong>Direction:</strong> {direction}</li>
        <li><strong>Caller:</strong> {caller}</li>
      </ul>
      {eventType === "zp-call-log-completed-event" && (
        <button
          onClick={createTask}
          className="mt-3 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create follow-up task
        </button>
      )}
    </div>
  );
};

export default EventModal;
