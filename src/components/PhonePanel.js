'use client';

import { useEffect, useState } from 'react';
import { PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SmartEmbed from '@/components/SmartEmbed';

export const OPEN_PHONE_EVENT = 'crm:open-phone';

export default function PhonePanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_PHONE_EVENT, show);
    return () => window.removeEventListener(OPEN_PHONE_EVENT, show);
  }, []);

  return (
    <>
      <div
        className={`${open ? 'fixed inset-0 z-40 flex flex-col overflow-y-auto' : 'hidden'} md:static md:inset-auto md:z-auto md:block md:w-[420px] md:h-full md:overflow-hidden bg-white md:border-l border-gray-200 md:p-4`}
      >
        <div className="md:hidden flex items-center justify-between h-14 px-2 pl-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-800">Phone</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close phone"
            className="h-11 w-11 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <SmartEmbed />
      </div>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open phone"
          className="md:hidden fixed bottom-4 right-4 z-30 h-14 px-5 flex items-center gap-2 rounded-full bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-700"
        >
          <PhoneIcon className="h-5 w-5" />
          Phone
        </button>
      )}
    </>
  );
}
