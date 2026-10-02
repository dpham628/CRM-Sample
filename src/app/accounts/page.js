"use client"

import SearchBar from "@/components/Searchbar";
import InsightsCard from "@/components/InsightsCard";
import React, { useState, useEffect } from "react";
import { accounts } from "@/data/accounts";

// Function to make a call using Zoom Smart Embed/click-to-call
export const makeCall = (phoneNumber, callerId) => {
  const iframe = document.querySelector('iframe#zoom-embeddable-phone-iframe');
  if (iframe && iframe.contentWindow) {
    const message = {
      type: 'zp-make-call',
      data: {
        number: phoneNumber, // The phone number you want to dial
        callerId: callerId, // The caller ID (optional)
        autoDial: true 
      }
    };
    // Send the message to the iframe
    iframe.contentWindow.postMessage(message, 'https://applications.zoom.us');
  } else {
    console.error('Iframe or contentWindow not ready. Cannot make call.');
  }
};

const Accounts = () => {
  const [insightsAccountId, setInsightsAccountId] = useState(null);

  const toggleInsights = (accountId) => {
    setInsightsAccountId((current) => (current === accountId ? null : accountId));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <SearchBar/>
      <h2 className="text-lg font-semibold mb-4">External Accounts</h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200 text-sm text-left rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Email</th>
              <th className="px-4 py-3 border-b">Phone Number</th>
              <th className="px-4 py-3 border-b">Description</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b">Insights</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
  {accounts.map((account) => (
    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 border-b">{account.id}</td>
      <td className="px-4 py-3 border-b font-medium">{account.name}</td>
      <td className="px-4 py-3 border-b text-gray-500">{account.email}</td>
      <td
        className="px-4 py-3 border-b text-gray-500 cursor-pointer hover:text-blue-500 transition"
        onClick={() => makeCall(account.phoneNumber)}
      >
        {account.phoneNumber}
      </td>
      <td className="px-4 py-3 border-b text-gray-500">{account.description}</td>
      <td className="px-4 py-3 border-b">
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {account.status}
        </span>
      </td>
      <td className="px-4 py-3 border-b">
        <button
          onClick={() => toggleInsights(account.id)}
          className="text-amber-700 hover:text-amber-900 hover:underline whitespace-nowrap"
        >
          {insightsAccountId === account.id ? 'Hide' : 'View'}
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {insightsAccountId && (
        <InsightsCard accountId={insightsAccountId} className="mt-4 max-w-md" />
      )}
    </div>
  );
}

export default Accounts;
