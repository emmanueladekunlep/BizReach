 'use client';

import { useState } from 'react';

interface MessageFormProps {
  selectedCount: number;
  onSend: (message: string) => void;
  onCancel: () => void;
}

export default function MessageForm({ selectedCount, onSend, onCancel }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    setIsSending(true);
    try {
      await onSend(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Send WhatsApp Messages</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Sending to <strong>{selectedCount}</strong> business{selectedCount > 1 ? 'es' : ''}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Use {'{name}'} for business name, {'{phone}'} for phone number
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi {name}, I found your business online and would like to connect..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px] text-gray-700"
            />
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Preview:</p>
            <p className="text-sm text-gray-700 italic mt-1">
              {message || 'Your message will appear here'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                '📤 Send Messages'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
