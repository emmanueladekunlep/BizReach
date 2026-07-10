 'use client';

import { useState } from 'react';

interface BusinessResult {
  name: string;
  url: string;
  phone: string;
  email: string;
  website: string;
  allPhones?: string[];
  selected?: boolean;
}

interface SearchResultsProps {
  results: BusinessResult[];
  onSendMessage: (selected: BusinessResult[], message: string) => void;
  onDownload: (selected: BusinessResult[]) => void;
}

export default function SearchResults({ results, onSendMessage, onDownload }: SearchResultsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      const all = new Set<number>();
      results.forEach((_, i) => all.add(i));
      setSelectedIds(all);
    }
  };

  const getSelectedResults = () => {
    return results.filter((_, i) => selectedIds.has(i));
  };

  const handleSend = () => {
    const selected = getSelectedResults();
    if (selected.length === 0) {
      alert('Please select at least one business');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    onSendMessage(selected, message);
  };

  const handleDownload = () => {
    const selected = getSelectedResults();
    if (selected.length === 0) {
      alert('Please select at least one business');
      return;
    }
    onDownload(selected);
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results found. Try a different search query.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === results.length && results.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-blue-600 rounded"
            />
            Select All ({results.length})
          </label>
          <span className="text-sm text-gray-500">
            {selectedIds.size} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowMessageBox(!showMessageBox)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ✏️ Compose Message
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            disabled={selectedIds.size === 0}
          >
            📤 Send WhatsApp
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            disabled={selectedIds.size === 0}
          >
            📥 Download CSV
          </button>
        </div>
      </div>

      {/* Message Box */}
      {showMessageBox && (
        <div className="bg-white p-4 rounded-lg shadow border border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Message
            <span className="text-xs text-gray-500 ml-2">
              (Use {`{name}`} for business name, {`{phone}`} for phone number)
            </span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi {name}, I found your business online and would like to connect..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
          />
          <div className="mt-2 text-xs text-gray-500">
            <p>Example: "Hi {name}, I saw your website and noticed you could improve your SEO. Would you like a free consultation?"</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Business Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Website</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(index)}
                      onChange={() => toggleSelect(index)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {result.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {result.phone ? (
                      <span className="text-green-600 font-medium">{result.phone}</span>
                    ) : (
                      <span className="text-gray-400">Not found</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {result.email ? (
                      <a href={`mailto:${result.email}`} className="text-blue-600 hover:underline">
                        {result.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not found</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">
                      {result.url.replace(/^https?:\/\//, '').slice(0, 30)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Found {results.length} businesses. Select the ones you want to contact.
      </div>
    </div>
  );
}
