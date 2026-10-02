"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { useTasks } from "@/context/task-context";

const FILTERS = ["Open", "Completed", "All"];

const Tasks = () => {
  const { tasks, loaded, toggleTask, removeTask, openTaskForm } = useTasks();
  const [filter, setFilter] = useState("Open");

  const visible = tasks
    .filter((task) => (filter === "All" ? true : filter === "Open" ? !task.completedAt : !!task.completedAt))
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Follow-up Tasks</h2>
        <button
          onClick={() => openTaskForm()}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          New task
        </button>
      </div>

      <div className="flex gap-2 mb-4 text-sm">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full border ${
              filter === f ? "bg-blue-50 border-blue-400 text-blue-700" : "border-gray-300 text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="mobile-cards min-w-full bg-white border border-gray-200 text-sm text-left rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 border-b">Done</th>
              <th className="px-4 py-3 border-b">Contact</th>
              <th className="px-4 py-3 border-b">Account</th>
              <th className="px-4 py-3 border-b">Next step</th>
              <th className="px-4 py-3 border-b">Due</th>
              <th className="px-4 py-3 border-b">Call</th>
              <th className="px-4 py-3 border-b"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loaded && visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No {filter === "All" ? "" : filter.toLowerCase()} tasks. Create one from Call Logs after a call.
                </td>
              </tr>
            )}
            {visible.map((task) => {
              const due = new Date(task.dueAt);
              const overdue = !task.completedAt && isPast(due);
              return (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors align-top">
                  <td data-label="Done" className="px-4 py-3 border-b">
                    <input
                      type="checkbox"
                      aria-label={`Mark "${task.nextStep}" done`}
                      checked={!!task.completedAt}
                      onChange={() => toggleTask(task.id)}
                    />
                  </td>
                  <td data-label="Contact" className="px-4 py-3 border-b">
                    <div>{task.contactName}</div>
                    <div className="text-xs text-gray-500">{task.contactEmail}</div>
                  </td>
                  <td data-label="Account" className="px-4 py-3 border-b">{task.account}</td>
                  <td data-label="Next step" className={`px-4 py-3 border-b ${task.completedAt ? "line-through text-gray-400" : "font-medium"}`}>
                    {task.nextStep}
                  </td>
                  <td data-label="Due" className={`px-4 py-3 border-b ${overdue ? "text-red-600" : ""}`}>
                    <div>{format(due, "EEE, MMM d, h:mm a")}</div>
                    <div className="text-xs">
                      {task.completedAt
                        ? "Completed"
                        : overdue
                        ? `Overdue by ${formatDistanceToNow(due)}`
                        : `in ${formatDistanceToNow(due)}`}
                    </div>
                  </td>
                  <td data-label="Call" className="px-4 py-3 border-b">{task.callId || "—"}</td>
                  <td data-label="Actions" className="px-4 py-3 border-b">
                    <button onClick={() => removeTask(task.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks;
