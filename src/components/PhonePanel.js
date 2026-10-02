'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneIcon } from '@heroicons/react/24/outline';
import SmartEmbed from './SmartEmbed';
import useDialog from '@/lib/use-dialog';

export default function PhonePanel() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setCompact(media.matches);
    const showPhone = () => setOpen(true);
    update();
    media.addEventListener('change', update);
    window.addEventListener('crm-open-phone', showPhone);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('crm-open-phone', showPhone);
    };
  }, []);

  useDialog(panelRef, open && compact, () => setOpen(false));

  return (
    <>
      <button
        className="phone-toggle"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="phone-panel"
      >
        <PhoneIcon className="h-5 w-5" aria-hidden="true" />
        Phone
      </button>
      <section
        id="phone-panel"
        ref={panelRef}
        tabIndex={-1}
        className={`phone-panel ${open ? 'is-open' : ''}`}
        role={open && compact ? 'dialog' : undefined}
        aria-modal={open && compact ? true : undefined}
        aria-label="Zoom Phone"
      >
        <div className="phone-sheet-header">
          <h2 className="font-semibold">Zoom Phone</h2>
          <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2">Close phone</button>
        </div>
        <SmartEmbed />
      </section>
    </>
  );
}
