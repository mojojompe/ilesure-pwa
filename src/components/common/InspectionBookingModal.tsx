import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, InformationCircleIcon, Calendar01Icon } from '@hugeicons/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface InspectionBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; time: string; name: string }) => void;
  loading?: boolean;
  initialName?: string;
  inspectionAvailability?: {
    availableDays?: string[];
    timeSlots?: string[];
    notes?: string;
  };
}

export const InspectionBookingModal: React.FC<InspectionBookingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
  initialName = '',
  inspectionAvailability,
}) => {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState(initialName);
  
  useEffect(() => {
    if (visible && initialName) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const defaultSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
  const slotsToDisplay = inspectionAvailability?.timeSlots?.length 
    ? inspectionAvailability.timeSlots 
    : defaultSlots;

  const handleSubmit = () => {
    if (!date) return;
    const timeStr = selectedSlot || (time ? time : '10:00 AM');
    onSubmit({ 
      date: date, 
      time: timeStr, 
      name 
    });
  };

  const isValid = date && (selectedSlot || time) && name;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-background rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-borderLight rounded-full mx-auto my-3 sm:hidden" />
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-borderLight shrink-0">
              <h2 className="text-xl font-bold text-textPrimary">Schedule Inspection</h2>
              <button onClick={onClose} className="p-1 rounded-full bg-surfaceLight text-textSecondary active:scale-95 transition-transform">
                <Cancel01Icon size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {inspectionAvailability?.notes && (
                <div className="flex items-start gap-2 p-3 bg-surface border border-primary rounded-xl mb-5">
                  <InformationCircleIcon size={18} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-textSecondary flex-1">
                    {inspectionAvailability.notes}
                  </p>
                </div>
              )}

              {inspectionAvailability?.availableDays && inspectionAvailability.availableDays.length > 0 && (
                <div className="mb-4">
                  <span className="block text-sm font-semibold text-textPrimary mb-2">Agent's Available Days</span>
                  <div className="flex flex-wrap gap-2">
                    {inspectionAvailability.availableDays.map(day => (
                      <div key={day} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border rounded-md">
                        <Calendar01Icon size={12} className="text-primary" />
                        <span className="text-xs font-semibold text-textPrimary">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <span className="block text-sm font-semibold text-textPrimary mb-2">Inspector's Name</span>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <span className="block text-sm font-semibold text-textPrimary mb-2">Preferred Date</span>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-textPrimary font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="mb-4">
                <span className="block text-sm font-semibold text-textPrimary mb-2">Available Time Slots</span>
                <div className="flex flex-wrap gap-2 mb-2">
                  {slotsToDisplay.map(slot => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setTime('');
                        }}
                        className={`px-3 py-2 rounded-xl border font-bold text-xs transition-colors ${
                          isSelected 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-surface border-border text-textPrimary'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className={`w-full h-12 px-4 rounded-xl border bg-surface font-medium focus:outline-none focus:border-primary ${
                    time && !selectedSlot ? 'border-primary text-primary' : 'border-border text-textSecondary'
                  }`}
                />
              </div>
            </div>

            <div className="p-6 border-t border-borderLight shrink-0 bg-background rounded-b-[24px]">
              <Button 
                fullWidth
                disabled={!isValid || loading}
                loading={loading}
                onClick={handleSubmit}
              >
                Schedule Inspection
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
