'use client';

import { useEffect, useRef } from 'react';

export default function useDialog(ref, open, onClose) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = ref.current;
    const background = [];
    let ancestor = dialog;
    while (ancestor.parentElement) {
      for (const sibling of ancestor.parentElement.children) {
        if (sibling !== ancestor) {
          background.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      ancestor = ancestor.parentElement;
      if (ancestor === document.body) break;
    }
    const selector = 'button, a[href], input, select, textarea, iframe, [tabindex="0"]';
    const focusable = () => [...dialog.querySelectorAll(selector)].filter((el) => !el.disabled && el.getClientRects().length);
    (focusable()[0] || dialog).focus();
    const onFocus = (event) => {
      if (!dialog.contains(event.target)) (focusable()[0] || dialog).focus();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocus);
      background.forEach(([element, wasInert]) => { element.inert = wasInert; });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [ref, open]);
}
