'use client';

import { useState } from 'react';
import SearchInterface from '@/components/SearchInterface';
import SearchResults from '@/components/SearchResults';
import SystemStats from '@/components/SystemStats';
import Header from '@/components/Header';

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  const handleSearch = async (query: string, method: string, options?: any) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      let payload: any = { query };
      
      switch (method) {
        case 'boolean':
          endpoint = '/api/search/boolean';
          break;
        case 'vector':
          endpoint = '/api/search/vector';
          payload.top_k = options?.top_k || 5;
          break;
        case 'bm25':
          endpoint = '/api/search/bm25';
          payload.top_k = options?.top_k || 5;
          break;
        case 'proximity':
          endpoint = '/api/search/proximity';
          payload.term1 = options?.term1 || '';
          payload.term2 = options?.term2 || '';
          payload.k = options?.k || 5;
          break;
        case 'multi':
          endpoint = '/api/search/multi';
          payload.top_k = options?.top_k || 5;
          break;
        default:
          endpoint = '/api/search/vector';
          payload.top_k = 5;
      }

      const response = await fetch(`http://localhost:5002${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Search Interface
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            System Statistics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'search' && (
          <div className="space-y-8">
            <SearchInterface onSearch={handleSearch} isLoading={isLoading} />
            {searchResults && <SearchResults results={searchResults} />}
          </div>
        )}

        {activeTab === 'stats' && (
          <SystemStats />
        )}
      </div>
    </main>
  );
}
