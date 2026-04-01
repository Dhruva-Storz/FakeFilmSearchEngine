import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { SearchEngineConfig } from '../types/schema';

interface Props {
  config: SearchEngineConfig;
}

const TABS = ['All', 'Images', 'News', 'Maps', 'Videos', 'Shopping', 'More'];

export default function ResultsPage({ config }: Props) {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(q);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch() {
    navigate(`/results?q=${encodeURIComponent(query)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  const resultCount = config.results.length;
  const fakeTime = (0.38 + Math.random() * 0.3).toFixed(2);
  const fakeTotal = (resultCount * 1_200_000 + Math.floor(Math.random() * 500_000)).toLocaleString();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/search'); }}
            className="flex-shrink-0"
          >
            {config.logoDataUrl ? (
              <img src={config.logoDataUrl} alt={config.engineName} className="h-7 sm:h-8 object-contain" />
            ) : (
              <span className="text-xl sm:text-2xl font-normal tracking-tight">
                <span className="text-blue-500">{config.engineName.slice(0, 1)}</span>
                <span className="text-red-400">{config.engineName.slice(1, 2)}</span>
                <span className="text-yellow-500">{config.engineName.slice(2, 3)}</span>
                <span className="text-blue-500">{config.engineName.slice(3, 4)}</span>
                <span className="text-green-500">{config.engineName.slice(4, 5)}</span>
                <span className="text-red-400">{config.engineName.slice(5)}</span>
              </span>
            )}
          </a>

          {/* Search bar */}
          <div className="flex-1 min-w-0 max-w-xl">
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 hover:shadow-md focus-within:shadow-md transition-shadow bg-white min-w-0">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-0 text-sm outline-none text-gray-800 bg-transparent"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button onClick={() => setQuery('')} className="ml-2 text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              <div className="w-px h-5 bg-gray-300 mx-3" />
              <button onClick={handleSearch}>
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 text-sm text-gray-700">
                <a href="#" className="block px-4 py-2 hover:bg-gray-50">Safe Search</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-50">Dark Theme</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-50">Language</a>
                <div className="border-t border-gray-100 my-1" />
                <a
                  href="/"
                  onClick={(e) => { e.preventDefault(); navigate('/', { replace: true }); }}
                  className="block px-4 py-2 hover:bg-gray-50 text-gray-400"
                >
                  Settings
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-4 text-sm overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-2 whitespace-nowrap border-b-2 transition-colors ${
                i === 0
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Results */}
      <main className="flex-1 px-4 sm:px-6 py-4 max-w-2xl">
        {/* Stats */}
        <p className="text-xs text-gray-500 mb-4">
          About {fakeTotal} results ({fakeTime} seconds)
        </p>

        {/* Result cards */}
        <div className="space-y-6">
          {config.results.map((result, i) => (
            <div key={i}>
              {/* URL breadcrumb */}
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <span className="truncate">{result.displayUrl}</span>
              </div>

              {/* Title */}
              {result.url ? (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base sm:text-lg text-blue-700 hover:underline leading-snug block break-words"
                >
                  {result.title}
                </a>
              ) : (
                <span className="text-base sm:text-lg text-blue-700 leading-snug block cursor-default break-words">
                  {result.title}
                </span>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {result.description}
              </p>

              {/* Sitelinks */}
              {result.sitelinks && result.sitelinks.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {result.sitelinks.map((sl, j) =>
                    sl.url ? (
                      <a key={j} href={sl.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {sl.text}
                      </a>
                    ) : (
                      <span key={j} className="text-sm text-blue-600 cursor-default">{sl.text}</span>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fake pagination */}
        <div className="mt-12 flex items-center gap-1 text-sm pb-10">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-medium">1</span>
          {[2, 3, 4, 5].map(n => (
            <button key={n} className="w-8 h-8 rounded-full text-blue-600 hover:bg-gray-100">{n}</button>
          ))}
          {[6, 7, 8].map(n => (
            <button key={n} className="hidden sm:flex w-8 h-8 rounded-full text-blue-600 hover:bg-gray-100 items-center justify-center">{n}</button>
          ))}
          <button className="ml-2 text-blue-600 hover:underline">Next &rsaquo;</button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-gray-500 border-t border-gray-200 mt-auto">
        <div className="px-6 py-3 flex flex-wrap justify-between gap-3">
          <div className="flex gap-4">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Advertising</a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/', { replace: true }); }}
              className="hover:underline"
            >
              Settings
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
