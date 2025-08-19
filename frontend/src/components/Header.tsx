export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              CORD-19 IR System
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced Information Retrieval for COVID-19 Research Papers
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Multi-Model Search Platform
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Boolean • TF-IDF • BM25 • Proximity
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
