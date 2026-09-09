import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, SparklesIcon, CheckmarkCircle02Icon } from '@hugeicons/react';
import { API_BASE_URL } from '../../api/config';

interface RequestUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RequestUpgradeModal: React.FC<RequestUpgradeModalProps> = ({
  visible,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'payments', label: 'Payments & Escrow' },
    { id: 'listings', label: 'Listings & Tours' },
    { id: 'inspections', label: 'Inspections & Safety' },
    { id: 'roommates', label: 'Roommates' },
    { id: 'mobile_app', label: 'App Features' },
    { id: 'general', label: 'Other' },
  ];

  const handleClose = () => {
    if (loading) return;
    setTitle('');
    setDescription('');
    setCategory('general');
    setSuccess(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and description.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/upgrade-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to submit request');
      }

      setSuccess('Your request has been added to our community roadmap stack!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit upgrade request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-left"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <SparklesIcon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-textPrimary">Request an Upgrade</h3>
                  <p className="text-xs text-textSecondary">Tell us what you'd like added to iléSure</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-1 rounded-full text-textTertiary hover:text-textPrimary"
              >
                <Cancel01Icon size={20} />
              </button>
            </div>

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 flex items-center gap-2">
                <CheckmarkCircle02Icon size={16} className="text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">
                  Feature or Upgrade Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Split rent into monthly installments"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        category === cat.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-background border border-border text-textSecondary hover:bg-neutral-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe how it should work and why it helps..."
                  className="w-full text-xs p-3 rounded-xl border border-border bg-background text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-textSecondary hover:text-textPrimary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RequestUpgradeModal;
