import React, { useState, useEffect } from 'react';
import { Location01Icon, Search01Icon, Cancel01Icon, Navigation03Icon } from '@hugeicons/react';
import { mapsService, Landmark, PlacePrediction } from '../../api/mapsService';

/**
 * Where a renter wants to search from.
 *
 * `landmark` and `coordinates` are two ways of naming the same thing: a seeded
 * place is sent by name so the server can use its own curated radius, while an
 * arbitrary address is geocoded here and sent as a point.
 */
export interface LocationAnchor {
  label: string;
  landmark?: string;
  /** GeoJSON order: [longitude, latitude]. */
  coordinates?: [number, number];
}

interface LocationAnchorPickerProps {
  value: LocationAnchor | null;
  onChange: (anchor: LocationAnchor | null) => void;
  /** One-tap option at the top — a student's campus. Null for everyone else. */
  suggestion?: { label: string; landmark: string } | null;
  /** Seeded place types to list before the renter types anything. */
  defaultTypes?: string;
}

/**
 * Lets any renter anchor their search to a place — a neighbourhood, an estate, a
 * campus, or any address Google knows. This was a student-only "near my school"
 * switch, which left a renter who is not a student with no location filter at
 * all; a campus is now just one of the places you can pick.
 */
export const LocationAnchorPicker: React.FC<LocationAnchorPickerProps> = ({
  value,
  onChange,
  suggestion,
  defaultTypes = 'area,estate,market,landmark',
}) => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Landmark[]>([]);
  const [addresses, setAddresses] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);

  // Seeded places first: curated, they carry their own radius, and they cost no
  // Google quota. Autocomplete only fills the gaps.
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      const seeded = await mapsService.landmarks(
        query.trim() || undefined,
        query.trim() ? undefined : defaultTypes
      );
      if (ignore) return;
      setPlaces(seeded.slice(0, 6));

      if (query.trim().length >= 3 && seeded.length < 4) {
        const predictions = await mapsService.autocomplete(query);
        if (!ignore) setAddresses(predictions.slice(0, 4));
      } else if (!ignore) {
        setAddresses([]);
      }
      if (!ignore) setLoading(false);
    }, query.trim() ? 350 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, defaultTypes]);

  const pickAddress = async (prediction: PlacePrediction) => {
    setLoading(true);
    const result = await mapsService.geocode(prediction.description);
    setLoading(false);
    if (!result) return;
    onChange({ label: prediction.description, coordinates: [result.lng, result.lat] });
    setQuery('');
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-accent bg-surface px-4 py-3">
        <Location01Icon size={16} className="text-accent shrink-0" />
        <span className="flex-1 truncate text-sm font-semibold text-textPrimary">{value.label}</span>
        <button onClick={() => onChange(null)} className="shrink-0 active:scale-95 transition-transform">
          <Cancel01Icon size={16} className="text-textTertiary" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-borderLight bg-surface px-4 h-11">
        <Search01Icon size={16} className="text-textTertiary shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Area, estate, campus or address"
          className="flex-1 bg-transparent border-none outline-none text-sm text-textPrimary placeholder:text-textMuted"
        />
        {loading && <span className="text-xs text-textTertiary">…</span>}
      </div>

      {suggestion && !query.trim() && (
        <button
          onClick={() => onChange({ label: suggestion.label, landmark: suggestion.landmark })}
          className="flex w-full items-center gap-2 border-b border-borderLight px-1 py-2.5 text-left"
        >
          <Location01Icon size={16} className="text-accent shrink-0" />
          <span className="flex-1 truncate text-sm font-bold text-textPrimary">Near {suggestion.label}</span>
        </button>
      )}

      {places.map(place => (
        <button
          key={place._id}
          onClick={() => onChange({ label: place.name, landmark: place.shortName || place.name })}
          className="flex w-full items-center gap-2 border-b border-borderLight px-1 py-2.5 text-left"
        >
          <Location01Icon size={16} className="text-textTertiary shrink-0" />
          <span className="flex-1 truncate text-sm text-textPrimary">{place.name}</span>
          {!!place.city && <span className="text-xs text-textTertiary shrink-0">{place.city}</span>}
        </button>
      ))}

      {addresses.map(prediction => (
        <button
          key={prediction.placeId}
          onClick={() => pickAddress(prediction)}
          className="flex w-full items-center gap-2 border-b border-borderLight px-1 py-2.5 text-left"
        >
          <Navigation03Icon size={16} className="text-textTertiary shrink-0" />
          <span className="flex-1 text-sm text-textPrimary">{prediction.description}</span>
        </button>
      ))}

      {!loading && query.trim().length >= 3 && places.length === 0 && addresses.length === 0 && (
        <p className="py-2.5 text-sm text-textTertiary">No places found for "{query.trim()}".</p>
      )}
    </div>
  );
};
