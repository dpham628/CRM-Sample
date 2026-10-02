'use client';

import { useState } from 'react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.contacts || []);
      console.log(data.contacts || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div className="flex space-x-2">
        <input
          type="text"
          className="w-full min-w-0 px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          aria-label="Search contacts"
          placeholder="Search contacts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          className="shrink-0 whitespace-nowrap px-4 py-2 rounded-xl bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
        >
          Search
        </button>
      </div>

      {isLoading && <div className="text-center py-4">Searching...</div>}

      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      {!isLoading && !error && results.length > 0 && (
        <div>
          {results.map((contact) => (
            <div key={contact.id} className="border-b p-3 hover:bg-gray-50">
              <div className="font-medium">{contact.name}</div>
              <div className="text-sm text-gray-500">{contact.phone_number}</div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && query && results.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No users found. Try again.
        </div>
      )}
    </div>
  );
};

export default SearchBar;
