import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useMapHooks';
import { searchLocation } from '../utils/helpers';
import type { SearchResult } from '../types';

interface SearchBarProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
}

const SearchBar = ({ onLocationSelect }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const data = await searchLocation(debouncedQuery);
          setResults(data);
          setShowResults(true);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleResultClick = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    setQuery(result.display_name);
    setShowResults(false);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search locations..."
          className="w-full px-2 py-1.5 pr-7 text-[10px] font-medium bg-gradient-to-r from-cyan-200 to-purple-200 rounded-lg shadow-lg border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all duration-300 hover:shadow-xl"
        />
        <div className="absolute right-2 top-2">
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {showResults && (
        <div className="mt-2 bg-gradient-to-br from-cyan-100 via-purple-100 to-pink-100 rounded-lg shadow-2xl border-2 border-purple-400 max-h-48 overflow-y-auto animate-slide-down">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={index}
                onClick={() => handleResultClick(result)}
                className="p-2 hover:bg-gradient-to-r hover:from-cyan-300 hover:via-blue-300 hover:to-purple-300 cursor-pointer border-b border-purple-300 last:border-b-0 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <p className="text-xs text-gray-800 font-medium">📍 {result.display_name}</p>
              </div>
            ))
          ) : (
            <div className="p-3 text-center">
              <p className="text-xs text-gray-600 font-medium">❌ No results found</p>
              <p className="text-[10px] text-gray-500 mt-1">
                Try searching for: cities, districts, or major landmarks
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
