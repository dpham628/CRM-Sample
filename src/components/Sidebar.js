'use client';

import {
  HomeIcon,
  UserGroupIcon,
  PhoneIcon,
  InformationCircleIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: HomeIcon, href: '/' },
  { label: 'Accounts', icon: UserGroupIcon, href: '/accounts' },
  { label: 'Call Logs', icon: PhoneIcon, href: '/call-logs' },
  { label: 'Tasks', icon: ClipboardDocumentCheckIcon, href: '/tasks' },
  { label: 'Instructions', icon: InformationCircleIcon, href: '/instructions' },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="sidebar h-dvh w-full bg-white shadow-lg flex flex-col">
      <div className="sidebar-brand pt-6 pl-6 text-xl font-bold text-blue-600">My CRM</div>

      <nav aria-label="Main navigation" className="flex-1 pl-6 pt-4 pr-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={pathname === item.href ? 'page' : undefined}
            aria-label={item.label}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label === 'Instructions' ? <><span className="desktop-nav-label">Instructions</span><span className="mobile-nav-label">More</span></> : item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer pl-6 pr-4 pb-4 text-sm text-gray-400 border-t">
        &copy; 2025 Your Company
      </div>
    </aside>
  );
}

export default Sidebar;