'use client';

import { useState, useEffect } from 'react';

interface SystemStatsData {
  total_documents: number;
  total_terms: number;
  avg_document_length: number;
  tfidf_features: number;
  search_methods: string[];
  dataset_info: {
    name: string;
    source: string;
    description: string;
  };
}

interface TermStats {
  total_unique_terms: number;
  top_terms_by_document_frequency: [string, number][];
  term_length_distribution: Record<string, number>;
  avg_term_length: number;
}

interface DocumentStats {
  total_documents: number;
  total_terms: number;
  average_document_length: number;
  min_document_length: number;
  max_document_length: number;
  length_distribution: Record<string, number>;
}

export default function SystemStats() {
  const [systemStats, setSystemStats] = useState<SystemStatsData | null>(null);
  const [termStats, setTermStats] = useState<TermStats | null>(null);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Fetch system stats
        let systemData = null;
        try {
          const systemResponse = await fetch('http://localhost:5002/api/stats/');
          if (!systemResponse.ok) {
            throw new Error(`System stats API error: ${systemResponse.status}`);
          }
          console.log('System stats response:', systemResponse);
          systemData = await systemResponse.json();
          if (systemData && !systemData.error) {
            setSystemStats(systemData);
          } else {
            setError(systemData?.error || 'Failed to fetch system statistics');
            return;
          }
        } catch (err) {
          setError('Failed to fetch system statistics (API error)');
          console.error('System stats API error:', err);
          return;
        }

        // Fetch term stats
        let termData = null;
        try {
          const termResponse = await fetch('http://localhost:5002/api/stats/terms');
          if (!termResponse.ok) {
            throw new Error(`Term stats API error: ${termResponse.status}`);
          }
          termData = await termResponse.json();
          if (termData && !termData.error) {
            setTermStats(termData);
          } else {
            setError(termData?.error || 'Failed to fetch term statistics');
            return;
          }
        } catch (err) {
          setError('Failed to fetch term statistics (API error)');
          console.error('Term stats API error:', err);
          return;
        }

        // Fetch document stats
        let docData = null;
        try {
          const docResponse = await fetch('http://localhost:5002/api/stats/documents');
          if (!docResponse.ok) {
            throw new Error(`Document stats API error: ${docResponse.status}`);
          }
          docData = await docResponse.json();
          if (docData && !docData.error) {
            setDocumentStats(docData);
          } else {
            setError(docData?.error || 'Failed to fetch document statistics');
            return;
          }
        } catch (err) {
          setError('Failed to fetch document statistics (API error)');
          console.error('Document stats API error:', err);
          return;
        }

      } catch (err) {
        setError('Failed to fetch system statistics (unexpected error)');
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">System Overview</h2>
        
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{systemStats.total_documents}</div>
              <div className="text-sm text-blue-800">Total Documents</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{systemStats.total_terms}</div>
              <div className="text-sm text-green-800">Unique Terms</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{systemStats.avg_document_length ? systemStats.avg_document_length.toFixed(1) : '0.0'}</div>
              <div className="text-sm text-purple-800">Avg Doc Length</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{systemStats.tfidf_features || 0}</div>
              <div className="text-sm text-orange-800">TF-IDF Features</div>
            </div>
          </div>
        )}

        {/* Dataset Information */}
        {systemStats && systemStats.dataset_info && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Dataset Information</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Name:</strong> {systemStats.dataset_info.name || 'CORD-19 Dataset'}</p>
              <p><strong>Source:</strong> {systemStats.dataset_info.source || 'COVID-19 Open Research Dataset'}</p>
              <p><strong>Description:</strong> {systemStats.dataset_info.description || 'Scientific literature about COVID-19 and coronavirus family'}</p>
            </div>
          </div>
        )}

        {/* Search Methods */}
        {systemStats && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Available Search Methods</h3>
            <div className="flex flex-wrap gap-2">
              {(systemStats.search_methods || []).map((method) => (
                <span
                  key={method}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Statistics */}
      {documentStats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Document Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{documentStats.total_documents}</div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{documentStats.total_terms}</div>
              <div className="text-sm text-gray-600">Total Terms</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{documentStats.average_document_length ? documentStats.average_document_length.toFixed(1) : '0.0'}</div>
              <div className="text-sm text-gray-600">Average Length</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {(documentStats.max_document_length || 0) - (documentStats.min_document_length || 0)}
              </div>
              <div className="text-sm text-gray-600">Length Range</div>
            </div>
          </div>

          {/* Length Distribution */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Document Length Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(documentStats.length_distribution || {}).map(([range, count]) => (
                <div key={range} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{count}</div>
                  <div className="text-xs text-gray-600">{range} words</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Term Statistics */}
      {termStats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Term Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{termStats.total_unique_terms}</div>
              <div className="text-sm text-blue-800">Unique Terms</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{termStats.avg_term_length ? termStats.avg_term_length.toFixed(1) : '0.0'}</div>
              <div className="text-sm text-green-800">Average Term Length</div>
            </div>
          </div>

          {/* Top Terms */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Top 20 Terms by Document Frequency</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {(termStats.top_terms_by_document_frequency || []).slice(0, 20).map(([term, freq]) => (
                <div key={term} className="p-2 bg-gray-50 rounded text-center">
                  <div className="text-sm font-medium text-gray-900">{term}</div>
                  <div className="text-xs text-gray-600">{freq} docs</div>
                </div>
              ))}
            </div>
          </div>

          {/* Term Length Distribution */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Term Length Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {Object.entries(termStats.term_length_distribution || {})
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .slice(0, 12)
                .map(([length, count]) => (
                  <div key={length} className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-900">{count}</div>
                    <div className="text-xs text-gray-600">{length} chars</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
