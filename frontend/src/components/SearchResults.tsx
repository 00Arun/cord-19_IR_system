'use client';

interface SearchResultsProps {
  results: any;
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <h3 className="text-lg font-medium mb-2">Search Error</h3>
          <p>{results.error}</p>
        </div>
      </div>
    );
  }

  const renderBooleanResults = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Results: {results.results_count} documents</span>
        <span>Processing time: {results.processing_time}</span>
      </div>
      {results.results.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No documents found matching all query terms.</p>
      ) : (
        <div className="space-y-3">
          {results.results.map((doc: any, index: number) => (
            <div key={doc.doc_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {index + 1}. {doc.title}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Document ID:</strong> {doc.doc_id}</p>
                    <p><strong>Filename:</strong> {doc.filename}</p>
                    <p><strong>Length:</strong> {doc.length} terms</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVectorResults = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Results: {results.results_count} documents (Top-{results.top_k})</span>
        <span>Processing time: {results.processing_time}</span>
      </div>
      {results.results.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No relevant documents found.</p>
      ) : (
        <div className="space-y-3">
          {results.results.map((doc: any, index: number) => (
            <div key={doc.doc_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {index + 1}. {doc.title}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Document ID:</strong> {doc.doc_id}</p>
                    <p><strong>Relevance Score:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{doc.score.toFixed(4)}</span></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProximityResults = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Results: {results.results_count} documents</span>
        <span>Processing time: {results.processing_time}</span>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        <p><strong>Searching for:</strong> "{results.term1}" and "{results.term2}" within {results.proximity_threshold} words</p>
      </div>
      {results.results.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No documents found with the specified terms in proximity.</p>
      ) : (
        <div className="space-y-3">
          {results.results.map((doc: any, index: number) => (
            <div key={doc.doc_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {index + 1}. {doc.title}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Document ID:</strong> {doc.doc_id}</p>
                    <p><strong>Distance:</strong> <span className="font-mono bg-green-100 px-2 py-1 rounded">{doc.distance} words</span></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMultiModelResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Model Search Results</h3>
        <p className="text-gray-600">Query: "{results.query}" (Top-{results.top_k})</p>
      </div>
      
      {Object.entries(results.results).map(([method, methodResults]: [string, any]) => (
        <div key={method} className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 capitalize">
            {method === 'vector' ? 'TF-IDF Vector Search' : 
             method === 'bm25' ? 'BM25 Search' : 
             method === 'boolean' ? 'Boolean Search' : method} Results
          </h4>
          <div className="text-sm text-gray-600 mb-3">
            <span>Results: {methodResults.results_count} documents</span>
            <span className="mx-2">•</span>
            <span>Processing time: {methodResults.processing_time}</span>
          </div>
          
          {methodResults.results.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No results found.</p>
          ) : (
            <div className="space-y-2">
              {methodResults.results.slice(0, 3).map((doc: any, index: number) => (
                <div key={`${method}-${doc.doc_id}-${index}`} className="p-3 bg-white rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {index + 1}. {doc.title}
                      </h5>
                      <div className="text-xs text-gray-600 mt-1">
                        <span>ID: {doc.doc_id}</span>
                        {doc.score && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Score: {doc.score.toFixed(4)}</span>
                          </>
                        )}
                        {doc.distance && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Distance: {doc.distance} words</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {methodResults.results.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  ... and {methodResults.results.length - 3} more results
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderResults = () => {
    switch (results.method) {
      case 'Boolean Search':
        return renderBooleanResults();
      case 'TF-IDF Vector Search':
        return renderVectorResults();
      case 'BM25 Search':
        return renderVectorResults(); // Same format as vector
      case 'Proximity Search':
        return renderProximityResults();
      case 'Multi-Model Search':
        return renderMultiModelResults();
      default:
        return <p className="text-gray-500">Unknown search method.</p>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Search Results
        </h3>
        <div className="text-sm text-gray-600">
          <p><strong>Method:</strong> {results.method}</p>
          <p><strong>Query:</strong> "{results.query}"</p>
        </div>
      </div>
      
      {renderResults()}
    </div>
  );
}
