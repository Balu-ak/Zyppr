import React, { useState } from 'react';
import type { Service } from '../types';

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSlot: { day: string; time: string }) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ service, isOpen, onClose, onConfirm }) => {
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);

  if (!isOpen || !service) return null;

  const handleConfirm = () => {
    if (selectedSlot) {
      onConfirm(selectedSlot);
    }
  };
  
  const handleClose = () => {
    setSelectedSlot(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={handleClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">Book: {service.name}</h2>
        <p className="text-slate-400 mb-6">Please select an available time slot for the upcoming week.</p>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {service.weekly_schedule && service.weekly_schedule.length > 0 ? (
            service.weekly_schedule.map((slot, index) => (
              <button
                key={index}
                onClick={() => setSelectedSlot(slot)}
                className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                  selectedSlot?.day === slot.day && selectedSlot?.time === slot.time
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                    : 'bg-slate-700 border-slate-600 hover:border-[var(--color-primary-dark)]'
                }`}
              >
                <span className="font-semibold">{slot.day}</span> at <span className="font-mono">{slot.time}</span>
              </button>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No time slots available for this service.</p>
          )}
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors text-sm font-semibold">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSlot}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors text-sm font-semibold text-white disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;