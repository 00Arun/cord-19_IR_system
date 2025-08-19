'use client';

import { useState } from 'react';

interface SearchInterfaceProps {
  onSearch: (query: string, method: string, options?: any) => void;
  isLoading: boolean;
}

export default function SearchInterface({ onSearch, isLoading }: SearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('vector');
  const [topK, setTopK] = useState(5);
  const [term1, setTerm1] = useState('');
  const [term2, setTerm2] = useState('');
  const [proximityK, setProximityK] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (!query.trim()) return;

    let options = {};
    
    switch (method) {
      case 'vector':
      case 'bm25':
        options = { top_k: topK };
        break;
      case 'proximity':
        if (!term1.trim() || !term2.trim()) return;
        options = { term1: term1.trim(), term2: term2.trim(), k: proximityK };
        break;
    }

    onSearch(query.trim(), method, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Search CORD-19 Research Papers
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Query */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            Search Query
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query (e.g., 'covid treatment', 'vaccine development')"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
            required
          />
        </div>

        {/* Search Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Search Method
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: 'vector', label: 'TF-IDF Vector', description: 'Semantic search' },
              { value: 'bm25', label: 'BM25', description: 'Probabilistic ranking' },
              { value: 'boolean', label: 'Boolean', description: 'Exact matching' },
              { value: 'proximity', label: 'Proximity', description: 'Contextual search' },
              { value: 'multi', label: 'Multi-Model', description: 'All methods' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMethod(option.value)}
                className={`p-3 text-center rounded-lg border transition-colors ${
                  method === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`font-medium text-sm ${
                    method === option.value
                      ? 'text-blue-700'
                      : 'text-black group-hover:text-blue-700'
                  }`}
                >
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific Options */}
        {(method === 'vector' || method === 'bm25') && (
          <div>
            <label htmlFor="topK" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Results (Top-K)
            </label>
            <input
              type="number"
              id="topK"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
              min="1"
              max="20"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
        )}

        {method === 'proximity' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="term1" className="block text-sm font-medium text-gray-700 mb-2">
                First Term
              </label>
              <input
                type="text"
                id="term1"
                value={term1}
                onChange={(e) => setTerm1(e.target.value)}
                placeholder="e.g., covid"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="term2" className="block text-sm font-medium text-gray-700 mb-2">
                Second Term
              </label>
              <input
                type="text"
                id="term2"
                value={term2}
                onChange={(e) => setTerm2(e.target.value)}
                placeholder="e.g., treatment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="proximityK" className="block text-sm font-medium text-gray-700 mb-2">
                Max Distance (words)
              </label>
              <input
                type="number"
                id="proximityK"
                value={proximityK}
                onChange={(e) => setProximityK(parseInt(e.target.value) || 5)}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>
        )}

        {/* Search Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || !query.trim() || (method === 'proximity' && (!term1.trim() || !term2.trim()))}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              `Search with ${method === 'vector' ? 'TF-IDF' : method === 'bm25' ? 'BM25' : method === 'boolean' ? 'Boolean' : method === 'proximity' ? 'Proximity' : 'Multi-Model'}`
            )}
          </button>
        </div>
      </form>

      {/* Search Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Search Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>TF-IDF Vector:</strong> Best for semantic and conceptual searches</li>
          <li>• <strong>BM25:</strong> Balanced approach, good for general queries</li>
          <li>• <strong>Boolean:</strong> High precision for exact term matching</li>
          <li>• <strong>Proximity:</strong> Find terms that appear near each other</li>
          <li>• <strong>Multi-Model:</strong> Compare results from all methods</li>
        </ul>
      </div>
    </div>
  );
}
