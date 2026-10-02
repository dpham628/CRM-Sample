'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

// Glanceable facts about a contact's account from an external CRM data source
// (Salesforce via MCP, or mock data). Informational only — visually distinct
// from next-step tasks.
const KIND_ICONS = {
  renewal: ArrowPathIcon,
  opportunity: CurrencyDollarIcon,
  case: WrenchScrewdriverIcon,
  users: UserPlusIcon,
};

const InsightsCard = ({ accountId, phone, company, className = '' }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const query = accountId
    ? `accountId=${encodeURIComponent(accountId)}`
    : phone
      ? `phone=${encodeURIComponent(phone)}`
      : company
        ? `company=${encodeURIComponent(company)}`
        : null;

  useEffect(() => {
    if (!query) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/insights?${query}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Failed to load insights (${res.status})`);
        setData(body);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  if (!query) return null;

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-3 ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <LightBulbIcon className="h-4 w-4 text-amber-600" />
        <h4 className="text-sm font-semibold text-amber-900">Insights</h4>
        {data?.company && <span className="text-xs text-amber-700">· {data.company}</span>}
      </div>

      {loading && <p className="text-xs text-amber-700">Loading insights…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!loading && !error && data && (
        <>
          {data.insights.length === 0 ? (
            <p className="text-xs text-amber-700">No insights for this account.</p>
          ) : (
            <ul className="space-y-1.5">
              {data.insights.map((insight) => {
                const Icon = KIND_ICONS[insight.kind] || LightBulbIcon;
                return (
                  <li key={insight.id} className="flex items-start gap-1.5 text-xs text-amber-900">
                    <Icon className="h-3.5 w-3.5 mt-px shrink-0 text-amber-600" />
                    <span className="flex-1">
                      {insight.text}
                      {data.source && <span className="text-amber-600"> · {data.source}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default InsightsCard;
