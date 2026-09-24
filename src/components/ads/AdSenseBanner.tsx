/**
 * Policy-Compliant Google AdSense Placement Component
 *
 * Adheres to Google AdSense program policies:
 * - Clear labeling: "Advertisement" / "Sponsored"
 * - Proper margins to prevent accidental clicks
 * - Responsive containers without layout shift
 * - Toggleable per-placement via administrative settings
 */

import React, { useEffect, useRef } from 'react';

export type AdPlacementType = 'homepage' | 'movieListing' | 'movieDetails' | 'footer';

interface AdSenseBannerProps {
  placement: AdPlacementType;
  enabled?: boolean;
  publisherId?: string;
  slotId?: string;
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  placement,
  enabled = true,
  publisherId = 'ca-pub-1234567890123456',
  slotId = '1122334455',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if adsbygoogle script is already loaded
    const scriptId = 'google-adsense-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script && publisherId) {
      script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      document.head.appendChild(script);
    }

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // AdSense push might fail in local sandbox or blocked environment
    }
  }, [enabled, publisherId, slotId]);

  if (!enabled) {
    return null;
  }

  const placementDescriptions: Record<AdPlacementType, { label: string; format: string }> = {
    homepage: { label: 'Featured Partner Spotlight', format: 'Leaderboard (728x90 / Responsive)' },
    movieListing: { label: 'Recommended Showcase', format: 'In-Feed Native' },
    movieDetails: { label: 'Cinematic Partner', format: 'Medium Rectangle (300x250)' },
    footer: { label: 'Sponsored Placement', format: 'Footer Billboard' },
  };

  const info = placementDescriptions[placement] || { label: 'Advertisement', format: 'Responsive' };

  return (
    <div
      className={`my-8 mx-auto w-full max-w-5xl px-4 flex flex-col items-center ${className}`}
      data-ad-placement={placement}
    >
      {/* Policy requirement: Clearly distinct label so users know it's an advertisement */}
      <div className="w-full flex items-center justify-between text-[11px] font-medium tracking-widest text-zinc-500 uppercase mb-1.5 px-2">
        <span>Advertisement</span>
        <span>{info.label}</span>
      </div>

      {/* Ad Container with minimum height to avoid cumulative layout shift (CLS) */}
      <div className="w-full relative overflow-hidden rounded-xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-4 min-h-[90px] flex flex-col items-center justify-center text-center shadow-lg shadow-black/40">
        {/* Real AdSense Ins Element */}
        <ins
          ref={adRef}
          className="adsbygoogle w-full block text-center"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        {/* Fallback / Preview visualization when AdSense script is in sandbox/testing */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-xs text-zinc-400 py-1">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              AD
            </div>
            <div className="text-left">
              <p className="font-semibold text-zinc-300">Policy-Compliant Google AdSense Container</p>
              <p className="text-[11px] text-zinc-500">
                Slot: <span className="font-mono text-zinc-400">{slotId}</span> &bull; Pub:{' '}
                <span className="font-mono text-zinc-400">{publisherId}</span>
              </p>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-700/40">
            {info.format}
          </div>
        </div>
      </div>
    </div>
  );
};
