import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { clsx } from 'clsx';

/**
 * BUGFIX (flow audit): every control on this screen was decorative.
 *
 * The five toggles called `togglePrivacy`/`toggleSecurity`, which set local React state and
 * nothing else — no request, no persistence, so a setting a user changed reverted the moment
 * they navigated away. The three chevron rows ("Profile Visibility", "Download My Data",
 * "Delete Account") had no handler at all. There is no backend for any of it: the API has no
 * endpoint for profile visibility, location, analytics, biometrics or 2FA, and none for data
 * export or account deletion.
 *
 * A switch that flips and forgets is worse than an absent one — it tells the user their data
 * is handled a way it is not. "Delete Account" is the sharpest case: presenting a data right
 * the product does not yet honour.
 *
 * So the screen now states plainly what is not built yet. Implementing these for real —
 * particularly deletion, which needs decisions about what must be retained for bookings,
 * payments and signed contracts — is separate work, not something to smuggle into a UI fix.
 */
interface SettingRow {
  id: string;
  title: string;
  subtitle: string;
  /** Reflected in the disabled control so the intended default stays visible. */
  defaultOn?: boolean;
}

const PRIVACY_OPTIONS: SettingRow[] = [
  { id: 'profile', title: 'Profile Visibility', subtitle: 'Who can see your profile' },
  { id: 'location', title: 'Location Services', subtitle: 'Allow app to access your location', defaultOn: true },
  { id: 'analytics', title: 'Analytics', subtitle: 'Help improve iléSure with usage data', defaultOn: true },
];

const SECURITY_OPTIONS: SettingRow[] = [
  { id: 'biometric', title: 'Biometric Login', subtitle: 'Use fingerprint or face ID' },
  { id: '2fa', title: 'Two-Factor Authentication', subtitle: 'Add an extra layer of security' },
];

const DATA_OPTIONS: SettingRow[] = [
  { id: 'export', title: 'Download My Data', subtitle: 'Get a copy of your account data' },
  { id: 'delete', title: 'Delete Account', subtitle: 'Permanently delete your account and data' },
];

function ComingSoon() {
  return (
    <span className="shrink-0 rounded-full bg-borderLight px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-textTertiary">
      Coming soon
    </span>
  );
}

/** A switch rendered in its intended default position, visibly inert. */
function InertToggle({ on }: { on?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'w-12 h-6 rounded-full flex items-center p-0.5 opacity-40',
        on ? 'bg-accent' : 'bg-border'
      )}
    >
      <span className={clsx('w-5 h-5 bg-surface rounded-full shadow-sm', on && 'translate-x-6')} />
    </span>
  );
}

function SettingsGroup({ rows, withToggle }: { rows: SettingRow[]; withToggle: boolean }) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6">
      {rows.map((item, idx) => (
        <div
          key={item.id}
          className={clsx(
            'flex justify-between items-center px-4 py-4',
            idx < rows.length - 1 && 'border-b border-borderLight'
          )}
        >
          <div className="flex-1 mr-4">
            <h4 className="text-[15px] font-semibold text-textPrimary mb-0.5">{item.title}</h4>
            <p className="text-sm text-textSecondary leading-snug">{item.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <ComingSoon />
            {withToggle && <InertToggle on={item.defaultOn} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrivacySecurity() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Privacy & Security" onBack={() => navigate(-1)} />

        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <p className="mt-6 mb-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-snug text-textSecondary">
            These controls are not available yet. To ask about your data or to close your
            account in the meantime, contact support and we will handle it for you.
          </p>

          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-6 uppercase">
            PRIVACY
          </h3>
          <SettingsGroup rows={PRIVACY_OPTIONS} withToggle />

          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-4 uppercase">
            SECURITY
          </h3>
          <SettingsGroup rows={SECURITY_OPTIONS} withToggle />

          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 mt-4 uppercase">
            DATA
          </h3>
          <SettingsGroup rows={DATA_OPTIONS} withToggle={false} />
        </div>
      </div>
    </AppShell>
  );
}
