import React, { useState, useEffect, useMemo } from 'react';
import { Location01Icon, Search01Icon, Cancel01Icon } from '@hugeicons/react';
import { listingService, AvailableArea } from '../../api/listingService';
import { useListingStore } from '../../stores/listingStore';

/**
 * Where a renter wants to search from.
 * `areaCluster` matches the active listing areas available on the app.
 */
export interface LocationAnchor {
  label: string;
  areaCluster?: string;
  landmark?: string;
  /** GeoJSON order: [longitude, latitude]. */
  coordinates?: [number, number];
}

interface LocationAnchorPickerProps {
  value: LocationAnchor | null;
  onChange: (anchor: LocationAnchor | null) => void;
  /** One-tap option at the top, e.g. a student's campus. */
  suggestion?: { label: string; landmark: string } | null;
  /** Seeded place types (for backwards compatibility). */
  defaultTypes?: string;
}

export const LocationAnchorPicker: React.FC<LocationAnchorPickerProps> = ({
  value,
  onChange,
  suggestion,
}) => {
  const [query, setQuery] = useState('');
  const [serverAreas, setServerAreas] = useState<AvailableArea[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch locations currently available on the app from backend
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    listingService
      .getAreas()
      .then(areas => {
        if (!ignore && Array.isArray(areas)) {
          setServerAreas(areas);
        }
      })
      .catch(err => {
        console.error('Failed to load available areas', err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Also collect available areas from the listings currently loaded in store as an immediate/fallback cache
  const availableLocations = useMemo(() => {
    const areaMap = new Map<string, { name: string; count: number; avgPrice?: number }>();

    // 1. Add server areas
    serverAreas.forEach(a => {
      if (a.name && a.name.trim()) {
        const key = a.name.trim();
        areaMap.set(key.toLowerCase(), {
          name: key,
          count: a.propertyCount || 1,
          avgPrice: a.avgPrice,
        });
      }
    });

    // 2. Supplement with any listings in local store
    const storeListings = useListingStore.getState().listings || [];
    storeListings.forEach(l => {
      if (l.areaCluster && l.areaCluster.trim()) {
        const key = l.areaCluster.trim();
        const lower = key.toLowerCase();
        const existing = areaMap.get(lower);
        if (existing) {
          existing.count = Math.max(existing.count, 1);
        } else {
          areaMap.set(lower, {
            name: key,
            count: 1,
          });
        }
      }
    });

    return Array.from(areaMap.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [serverAreas]);

  // Filter locations based on user input
  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableLocations;
    return availableLocations.filter(loc => loc.name.toLowerCase().includes(q));
  }, [availableLocations, query]);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-surfaceLight px-4 py-3 shadow-sm">
        <Location01Icon size={18} className="text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-textPrimary truncate">{value.label}</p>
          <p className="text-[11px] text-textSecondary font-medium">Filtering by this location</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1 rounded-full hover:bg-black/5 active:scale-90 transition-transform"
          aria-label="Clear location filter"
        >
          <Cancel01Icon size={18} className="text-textTertiary" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-borderLight bg-surface px-4 h-11 focus-within:border-primary/50 transition-colors">
        <Search01Icon size={16} className="text-textTertiary shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter by available location..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-textPrimary placeholder:text-textMuted"
        />
        {loading && <span className="text-xs text-textTertiary animate-pulse">…</span>}
      </div>

      {suggestion && !query.trim() && (
        <button
          type="button"
          onClick={() => onChange({ label: suggestion.label, landmark: suggestion.landmark })}
          className="flex w-full items-center gap-2 border-b border-borderLight px-1 py-2.5 text-left active:bg-surfaceLight/50 transition-colors"
        >
          <Location01Icon size={16} className="text-primary shrink-0" />
          <span className="flex-1 truncate text-sm font-bold text-textPrimary">Near {suggestion.label}</span>
          <span className="text-[11px] font-semibold text-textTertiary bg-surfaceLight px-2 py-0.5 rounded-full">
            Campus
          </span>
        </button>
      )}

      {/* Available locations list */}
      <div className="max-h-52 overflow-y-auto divide-y divide-borderLight/60 rounded-lg">
        {filteredLocations.length > 0 ? (
          filteredLocations.map(location => (
            <button
              key={location.name}
              type="button"
              onClick={() => onChange({ label: location.name, areaCluster: location.name })}
              className="flex w-full items-center gap-2.5 px-2 py-2.5 text-left hover:bg-surfaceLight active:bg-surfaceLight/80 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Location01Icon size={15} className="text-primary" />
              </div>
              <span className="flex-1 truncate text-sm font-medium text-textPrimary">
                {location.name}
              </span>
              <span className="text-[11px] font-semibold text-textSecondary bg-surfaceLight border border-borderLight px-2.5 py-0.5 rounded-full shrink-0">
                {location.count} {location.count === 1 ? 'property' : 'properties'}
              </span>
            </button>
          ))
        ) : (
          <div className="py-4 px-2 text-center">
            <p className="text-sm font-medium text-textSecondary">
              {query.trim()
                ? `No listings currently available in "${query.trim()}"`
                : 'No locations currently available'}
            </p>
            <p className="text-xs text-textTertiary mt-1">
              Select from areas where properties are currently listed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
