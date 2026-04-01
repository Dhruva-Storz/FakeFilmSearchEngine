import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchEngineConfig } from '../types/schema';

interface Props {
  config: SearchEngineConfig;
}

export default function SearchPage({ config }: Props) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close menu on outside click
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-end px-4 py-3 gap-4">
        <nav className="hidden sm:flex items-center gap-5 text-sm text-gray-700">
          <a href="#" className="hover:underline">Images</a>
          <a href="#" className="hover:underline">Maps</a>
          <a href="#" className="hover:underline">News</a>
        </nav>

        {/* Hamburger / app grid menu */}
        <div className="relative" ref={menuRef}>
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
              <a href="#" className="block px-4 py-2 hover:bg-gray-50">Images</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-50">Maps</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-50">News</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-50">Videos</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-50">Shopping</a>
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
      </header>

      {/* Main centered content — sits slightly above true center like real search engines */}
      <main className="flex-1 flex flex-col items-center justify-center px-4" style={{ paddingBottom: '12vh' }}>
        {/* Logo */}
        <div className="mb-4 text-center">
          {config.logoDataUrl ? (
            <img src={config.logoDataUrl} alt={config.engineName} className="h-20 sm:h-36 object-contain mx-auto" />
          ) : (
            <h1 className="text-5xl sm:text-8xl font-normal tracking-tight select-none" style={{ fontFamily: 'Arial, sans-serif' }}>
              <span className="text-blue-500">{config.engineName.slice(0, 1)}</span>
              <span className="text-red-400">{config.engineName.slice(1, 2)}</span>
              <span className="text-yellow-500">{config.engineName.slice(2, 3)}</span>
              <span className="text-blue-500">{config.engineName.slice(3, 4)}</span>
              <span className="text-green-500">{config.engineName.slice(4, 5)}</span>
              <span className="text-red-400">{config.engineName.slice(5)}</span>
            </h1>
          )}
        </div>

        {/* Tagline */}
        <p className="text-gray-500 text-sm sm:text-lg mb-6 sm:mb-8 text-center px-2">{config.tagline}</p>

        {/* Search bar */}
        <div className="w-full max-w-2xl px-2 sm:px-0">
          <div className="flex items-center border border-gray-300 rounded-full pl-4 sm:pl-6 pr-2 py-2 sm:py-3 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow bg-white">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-base sm:text-lg outline-none text-gray-800 bg-transparent min-w-0"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button onClick={() => setQuery('')} className="mr-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              onClick={handleSearch}
              className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-gray-500 border-t border-gray-200">
        <div className="px-6 py-3 flex flex-wrap justify-between gap-3">
          <div className="flex gap-4">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Advertising</a>
            <a href="#" className="hover:underline">Business</a>
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
