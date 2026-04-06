"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/app" },
  { label: "Calendar", href: "/app/calendar" },
  { label: "Commissions", href: "/app/commissions" },
  { label: "Follow-ups", href: "/app/followups" },
  { label: "Agency", href: "/app/agency" },
  { label: "Carriers & Writing", href: "/app/carriers" },
  { label: "Reports", href: "/app/reports" },
];

export default function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="flex overflow-x-auto scrollbar-hide gap-1 px-2 sm:px-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 px-3 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
