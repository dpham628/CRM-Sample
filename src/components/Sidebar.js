'use client';

import { useState } from 'react';
import {
  HomeIcon,
  UserGroupIcon,
  PhoneIcon,
  InformationCircleIcon,
  ClipboardDocumentCheckIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', icon: HomeIcon, href: '/' },
  { label: 'Accounts', icon: UserGroupIcon, href: '/accounts' },
  { label: 'Call Logs', icon: PhoneIcon, href: '/call-logs' },
  { label: 'Tasks', icon: ClipboardDocumentCheckIcon, href: '/tasks' },
  { label: 'Instructions', icon: InformationCircleIcon, href: '/instructions' },
];

const SidebarContent = ({ onNavigate }) => (
  <>
    <nav className="flex-1 pl-6 pt-4 pr-4 space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>

    <div className="pl-6 pr-4 pb-4 text-sm text-gray-400 border-t">
      &copy; 2025 Your Company
    </div>
  </>
);

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden flex items-center gap-1 h-14 px-2 bg-white shadow">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="h-11 w-11 flex items-center justify-center rounded-lg text-gray-700 hover:bg-blue-50"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <span className="text-xl font-bold text-blue-600">My CRM</span>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 max-w-[80%] bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between pt-4 pl-6 pr-2">
              <span className="text-xl font-bold text-blue-600">My CRM</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="h-11 w-11 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <aside className="hidden md:flex h-screen w-64 bg-white shadow-lg flex-col">
        <div className="pt-6 pl-6 text-xl font-bold text-blue-600">My CRM</div>
        <SidebarContent />
      </aside>
    </>
  );
}

export default Sidebar;
