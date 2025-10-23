
import React from 'react';
import { X } from 'lucide-react';

interface ModalBaseProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export const ModalBase: React.FC<ModalBaseProps> = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4">
    <div className={`bg-gray-800 rounded-xl shadow-2xl ${wide ? 'w-full max-w-4xl' : 'w-full max-w-lg'} max-h-[90vh] overflow-y-auto p-6 transition-all duration-300 transform scale-100`}>
      <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition duration-150">
          <X className="w-6 h-6" />
        </button>
      </div>
      {children}
    </div>
  </div>
);
