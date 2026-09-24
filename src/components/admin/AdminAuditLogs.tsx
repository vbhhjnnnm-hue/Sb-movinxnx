/**
 * Admin Panel - Security Audit Logging
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, Shield, RefreshCw } from 'lucide-react';
import { AuditLog } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAuditLogs();
      setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            Security & Administrative Audit Logs
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable log trail of administrative actions, catalog modifications, and authentication events
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#0d0f17] border border-zinc-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="p-4">Action Event</th>
              <th className="p-4">Admin Email</th>
              <th className="p-4">Entity Type</th>
              <th className="p-4">Description / Metadata</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 font-sans animate-pulse">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 font-sans">
                  No logs recorded.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300 font-sans">{log.adminEmail}</td>
                  <td className="p-4 text-zinc-400 font-sans uppercase text-[10px] font-semibold">
                    {log.entityType}
                  </td>
                  <td className="p-4 text-zinc-300 font-sans max-w-sm truncate">
                    {log.metadata || '--'}
                  </td>
                  <td className="p-4 text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
