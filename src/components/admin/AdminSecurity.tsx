/**
 * Admin Panel - Security Architecture & Enforcement Audit
 */

import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Server,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

export const AdminSecurity: React.FC = () => {
  const securityItems = [
    {
      title: 'Server-Side TMDB API Key Isolation',
      desc: 'TMDB credentials reside exclusively within the Node.js server runtime environment. Zero keys exposed to client bundles or browser network tabs.',
      status: 'Enforced',
      type: 'tmdb',
    },
    {
      title: 'HTTP-Only Secure Cookie Architecture',
      desc: 'Authentication JWT tokens use SameSite=Lax and httpOnly flags to mitigate client-side script interception and Cross-Site Scripting (XSS).',
      status: 'Enforced',
      type: 'cookie',
    },
    {
      title: 'Bcrypt Password Salt & Hashing',
      desc: 'All user passwords undergo 10-round salted bcrypt cryptographic hashing prior to persistence. Plaintext credentials are never retained.',
      status: 'Enforced',
      type: 'crypto',
    },
    {
      title: 'Server-Authoritative Role-Based Access (RBAC)',
      desc: 'Client-side role claims are rejected. Admin endpoints verify the authenticated subject against backend database records on every request.',
      status: 'Enforced',
      type: 'rbac',
    },
    {
      title: 'Production HTTP Security Headers',
      desc: 'X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, X-XSS-Protection: 1, Referrer-Policy: strict-origin-when-cross-origin.',
      status: 'Enforced',
      type: 'headers',
    },
    {
      title: 'Duplicate Movie Constraint Guard',
      desc: 'Atomic validation on TMDB ID prevents duplicate titles in catalog with explicit user-friendly feedback.',
      status: 'Enforced',
      type: 'integrity',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
          Security & Compliance Audit
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Cryptographic security controls, token isolation, and role verification posture
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityItems.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-100">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{item.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {item.status}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
