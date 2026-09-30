"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { usePostCall } from "@/context/post-call-context";
import { ACTION_TYPES } from "@/components/PostCallWorkflowModal";

const FILTERS = ["Open", "Completed", "All"];

const mailtoFor = (item) => {
  const subject =
    item.type === "send_msa"
      ? `Master Services Agreement — ${item.company}`
      : `Following up on our call`;
  const body = [`Hi ${item.contactName.split(" ")[0]},`, "", item.callSummary].join("\n");
  return `mailto:${item.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const ActionItems = () => {
  const { actionItems, loaded, toggleComplete, removeActionItem, openWorkflow } = usePostCall();
  const [filter, setFilter] = useState("Open");

  const visible = actionItems
    .filter((item) =>
      filter === "All" ? true : filter === "Open" ? !item.completedAt : !!item.completedAt
    )
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Post-call Action Items</h2>
        <button
          onClick={() => openWorkflow()}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          New post-call workflow
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
        <table className="min-w-full bg-white border border-gray-200 text-sm text-left rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 border-b">Done</th>
              <th className="px-4 py-3 border-b">Action</th>
              <th className="px-4 py-3 border-b">Contact / Account</th>
              <th className="px-4 py-3 border-b">Call</th>
              <th className="px-4 py-3 border-b">Due</th>
              <th className="px-4 py-3 border-b"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loaded && visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No {filter === "All" ? "" : filter.toLowerCase()} action items. Start a post-call workflow from Call Logs.
                </td>
              </tr>
            )}
            {visible.map((item) => {
              const due = new Date(item.dueAt);
              const overdue = !item.completedAt && isPast(due);
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors align-top">
                  <td className="px-4 py-3 border-b">
                    <input
                      type="checkbox"
                      aria-label={`Mark "${item.title}" done`}
                      checked={!!item.completedAt}
                      onChange={() => toggleComplete(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 border-b">
                    <div className={item.completedAt ? "line-through text-gray-400" : "font-medium"}>
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500">{ACTION_TYPES[item.type]?.label}</div>
                    {item.callSummary && (
                      <div className="text-xs text-gray-500 mt-1 max-w-xs">{item.callSummary}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b">
                    <div>{item.contactName}</div>
                    <div className="text-xs text-gray-500">{item.company}</div>
                  </td>
                  <td className="px-4 py-3 border-b">{item.callId || "—"}</td>
                  <td className={`px-4 py-3 border-b ${overdue ? "text-red-600" : ""}`}>
                    <div>{format(due, "EEE, MMM d, h:mm a")}</div>
                    <div className="text-xs">
                      {item.completedAt
                        ? "Completed"
                        : overdue
                        ? `Overdue by ${formatDistanceToNow(due)}`
                        : `in ${formatDistanceToNow(due)}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b whitespace-nowrap space-x-3">
                    {item.type !== "custom" && !item.completedAt && (
                      <a href={mailtoFor(item)} className="text-blue-600 hover:underline">
                        Draft email
                      </a>
                    )}
                    <button onClick={() => removeActionItem(item.id)} className="text-red-600 hover:underline">
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

export default ActionItems;
