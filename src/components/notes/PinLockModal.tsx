import React, { useState } from 'react';
import { Lock, KeyRound, X } from 'lucide-react';

interface PinLockModalProps {
  currentPin: string | null;
  onSetPin: (newPin: string | null) => void;
  onClose: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  currentPin,
  onSetPin,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('Please enter a 4-digit numeric code');
      return;
    }
    onSetPin(pin);
    onClose();
  };

  const handleRemove = () => {
    onSetPin(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-sm w-full p-6 text-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                {currentPin ? 'Change Privacy Lock' : 'Set Notes Passcode'}
              </h3>
              <p className="text-xs text-stone-500">Protect notes with 4-digit PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              4-Digit PIN Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="••••"
                className="w-full pl-9 pr-4 py-2 text-center text-lg font-mono tracking-widest bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            {currentPin && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex-1 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
              >
                Remove PIN
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
            >
              {currentPin ? 'Update PIN' : 'Enable Lock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
