"use client"

import SearchBar from "@/components/Searchbar";
import React, { useState, useEffect } from "react";
import { accounts } from "@/data/accounts";
import { OPEN_PHONE_EVENT } from "@/components/PhonePanel";

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
    window.dispatchEvent(new Event(OPEN_PHONE_EVENT));
  } else {
    console.error('Iframe or contentWindow not ready. Cannot make call.');
  }
};

const Accounts = () => {

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <SearchBar/>
      <h2 className="text-lg font-semibold mt-4 md:mt-0 mb-4">External Accounts</h2>
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
            </tr>
          </thead>
          <tbody className="text-gray-700">
  {accounts.map((account) => (
    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 border-b">{account.id}</td>
      <td className="px-4 py-3 border-b font-medium">{account.name}</td>
      <td className="px-4 py-3 border-b text-gray-500 whitespace-nowrap md:whitespace-normal">{account.email}</td>
      <td
        className="px-4 py-3 border-b text-gray-500 cursor-pointer hover:text-blue-500 transition whitespace-nowrap md:whitespace-normal"
        onClick={() => makeCall(account.phoneNumber)}
      >
        {account.phoneNumber}
      </td>
      <td className="px-4 py-3 border-b text-gray-500 min-w-48 md:min-w-0">{account.description}</td>
      <td className="px-4 py-3 border-b">
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {account.status}
        </span>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
}

export default Accounts;
