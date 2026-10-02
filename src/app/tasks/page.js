"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { useTasks } from "@/context/task-context";
import { CURRENT_REP_ID } from "@/data/team";

const FILTERS = ["Open", "Completed", "All"];
const OWNER_FILTERS = [
  { key: "all", label: "Everyone" },
  { key: "mine", label: "Mine" },
  { key: "others", label: "Assigned to others" },
  { key: "escalations", label: "Escalations" },
];

const isOther = (task) => !!task.ownerId && task.ownerId !== CURRENT_REP_ID;

const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const Tasks = () => {
  const { tasks, loaded, toggleTask, removeTask, openTaskForm } = useTasks();
  const [filter, setFilter] = useState("Open");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const visible = tasks
    .filter((task) => (filter === "All" ? true : filter === "Open" ? !task.completedAt : !!task.completedAt))
    .filter((task) =>
      ownerFilter === "all"
        ? true
        : ownerFilter === "mine"
        ? !isOther(task)
        : ownerFilter === "others"
        ? isOther(task)
        : task.type === "escalation"
    )
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Follow-up Tasks</h2>
        <button
          onClick={() => openTaskForm()}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          New task
        </button>
      </div>

      <div className="flex gap-2 mb-2 text-sm">
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
      <div className="flex gap-2 mb-4 text-sm">
        {OWNER_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setOwnerFilter(f.key)}
            className={`px-3 py-1 rounded-full border ${
              ownerFilter === f.key
                ? "bg-blue-50 border-blue-400 text-blue-700"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200 text-sm text-left rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 border-b">Done</th>
              <th className="px-4 py-3 border-b">Contact</th>
              <th className="px-4 py-3 border-b">Account</th>
              <th className="px-4 py-3 border-b">Next step</th>
              <th className="px-4 py-3 border-b">Owner</th>
              <th className="px-4 py-3 border-b">Due</th>
              <th className="px-4 py-3 border-b">Call</th>
              <th className="px-4 py-3 border-b"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loaded && visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No {filter === "All" ? "" : filter.toLowerCase()} tasks. Create one from Call Logs after a call.
                </td>
              </tr>
            )}
            {visible.map((task) => {
              const due = new Date(task.dueAt);
              const overdue = !task.completedAt && isPast(due);
              const other = isOther(task);
              return (
                <React.Fragment key={task.id}>
                  <tr className="hover:bg-gray-50 transition-colors align-top">
                    <td className="px-4 py-3 border-b">
                      <input
                        type="checkbox"
                        aria-label={`Mark "${task.nextStep}" done`}
                        checked={!!task.completedAt}
                        onChange={() => toggleTask(task.id)}
                      />
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div>{task.contactName}</div>
                      <div className="text-xs text-gray-500">{task.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 border-b">{task.account}</td>
                    <td className={`px-4 py-3 border-b ${task.completedAt ? "line-through text-gray-400" : "font-medium"}`}>
                      {task.nextStep}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {task.source === "transcript" && (
                          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                            From transcript
                          </span>
                        )}
                        {task.type === "escalation" && (
                          <span className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
                            Escalation · high
                          </span>
                        )}
                      </div>
                      {task.snippet && (
                        <div className="text-xs text-gray-500 font-normal italic mt-1">“{task.snippet}”</div>
                      )}
                      {task.handoff && (
                        <button
                          onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                          className="block text-xs text-blue-600 hover:underline font-normal mt-1"
                        >
                          {expandedId === task.id ? "Hide handoff" : "View handoff"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div>{other ? task.ownerName : "You"}</div>
                      {other && <div className="text-xs text-gray-500">{task.ownerRole}</div>}
                    </td>
                    <td className={`px-4 py-3 border-b ${overdue ? "text-red-600" : ""}`}>
                      <div>{format(due, "EEE, MMM d, h:mm a")}</div>
                      <div className="text-xs">
                        {task.completedAt
                          ? "Completed"
                          : overdue
                          ? `Overdue by ${formatDistanceToNow(due)}`
                          : `in ${formatDistanceToNow(due)}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b">{task.callId || "—"}</td>
                    <td className="px-4 py-3 border-b">
                      <button onClick={() => removeTask(task.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedId === task.id && task.handoff && (
                    <tr className="bg-amber-50/60">
                      <td colSpan={8} className="px-4 py-3 border-b">
                        <HandoffCard handoff={task.handoff} task={task} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HandoffCard = ({ handoff, task }) => (
  <div className="text-xs text-gray-700 space-y-2">
    <div className="flex flex-wrap justify-between gap-2">
      <div className="font-medium text-gray-800">
        Sent to {handoff.recipientName} ({handoff.recipientRole} · {handoff.recipientDepartment}) —{" "}
        {handoff.recipientEmail}
      </div>
      <div className="text-gray-500">
        Notified via mock outbox{handoff.sentAt ? ` · ${format(new Date(handoff.sentAt), "MMM d, h:mm a")}` : ""}
      </div>
    </div>
    <div>
      <span className="font-medium">Subject:</span> {handoff.subject}
    </div>
    <div>
      <span className="font-medium">Call summary:</span> {handoff.summary}
    </div>
    <div>
      <span className="font-medium">Client context:</span> {task.contactName}
      {task.contactEmail ? ` (${task.contactEmail})` : ""}
      {task.account ? ` · ${task.account}` : ""}
    </div>
    {handoff.orders?.length > 0 && (
      <div>
        <span className="font-medium">Recent orders / invoices:</span>
        <ul className="list-disc ml-5 mt-0.5">
          {handoff.orders.map((order) => (
            <li key={order.orderNumber}>
              {order.orderNumber} — {order.product} — {money(order.amount)} —{" "}
              {format(new Date(order.orderedAt), "MMM d, yyyy")} — {order.status}
            </li>
          ))}
        </ul>
      </div>
    )}
    <pre className="whitespace-pre-wrap bg-white border border-amber-200 rounded p-2 text-gray-700">
      {handoff.body}
    </pre>
  </div>
);

export default Tasks;
