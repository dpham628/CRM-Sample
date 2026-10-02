import React, { useState, useEffect, useRef } from "react";
import useDialog from "@/lib/use-dialog";

const CallDetailsModal = ({ callId, onClose }) => {
  const [callDetails, setCallDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);
  useDialog(dialogRef, !!callId, onClose);

  useEffect(() => {
    const fetchCallDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/calls/${callId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Failed to fetch call details: ${res.status} ${errorData.error || ''}`);
        }
        const data = await res.json();
        setCallDetails(data);
      } catch (err) {
        setError(err.message || "Failed to fetch call details");
      } finally {
        setLoading(false);
      }
    };

    if (callId) {
      fetchCallDetails();
    }
  }, [callId]);

  if (!callId) return null;

  const formatPhoneNumber = (phoneNumber) => phoneNumber || 'N/A';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const seconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ${seconds % 60} sec`;
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="call-details-title" className="dialog-panel bg-white rounded-lg shadow-xl w-full max-w-md mx-4 flex flex-col">
        {/* Header */}
        <div className="dialog-header flex justify-between items-center px-6 py-4 border-b">
          <h3 id="call-details-title" className="text-lg font-semibold text-gray-800">Call Details</h3>
          <button onClick={onClose} aria-label="Close call details" className="text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="dialog-content px-6 py-4 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : callDetails ? (
            <ul className="space-y-4 text-sm">
              {/* General Info */}
              <li className="flex justify-between">
                <span className="font-medium text-gray-600">Call ID:</span>
                <span className="text-gray-800">{callDetails.id || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-600">Direction:</span>
                <span className="text-gray-800 capitalize">{callDetails.direction || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-600">Call Type:</span>
                <span className="text-gray-800 capitalize">{callDetails.call_type || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-600">Start Time:</span>
                <span className="text-gray-800">{formatDate(callDetails.start_time)}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-600">End Time:</span>
                <span className="text-gray-800">{formatDate(callDetails.end_time)}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-600">Duration:</span>
                <span className="text-gray-800">{calculateDuration(callDetails.start_time, callDetails.end_time)}</span>
              </li>

              {/* Caller Info */}
              <li className="pt-2">
                <span className="font-medium text-gray-600 block mb-2">Caller Information:</span>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-gray-800">{callDetails.caller_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Number:</span>
                    <span className="text-gray-800">{formatPhoneNumber(callDetails.caller_did_number)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Extension:</span>
                    <span className="text-gray-800">{callDetails.caller_ext_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-800">{callDetails.caller_email || 'N/A'}</span>
                  </div>
                </div>
              </li>

              {/* Callee Info */}
              <li className="pt-2">
                <span className="font-medium text-gray-600 block mb-2">Callee Information:</span>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-gray-800">{callDetails.callee_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Number:</span>
                    <span className="text-gray-800">{formatPhoneNumber(callDetails.callee_did_number)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Extension:</span>
                    <span className="text-gray-800">{callDetails.callee_ext_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-800">{callDetails.callee_email || 'N/A'}</span>
                  </div>
                </div>
              </li>

              {/* Call Path */}
              {callDetails.call_path && callDetails.call_path.length > 0 && (
                <li className="pt-2">
                  <span className="font-medium text-gray-600 block mb-2">Call Path:</span>
                  <div className="pl-4 space-y-3">
                    {callDetails.call_path.map((segment, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-3 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Segment:</span>
                          <span className="text-gray-800">{segment.segment || index + 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event:</span>
                          <span className="text-gray-800 capitalize">{segment.event || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Result:</span>
                          <span className="text-gray-800 capitalize">{segment.result || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Start:</span>
                          <span className="text-gray-800">{formatDate(segment.start_time)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">End:</span>
                          <span className="text-gray-800">{formatDate(segment.end_time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-500">No call details found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="dialog-footer border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallDetailsModal;