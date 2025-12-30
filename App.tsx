
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import SubmitForm from './components/SubmitForm';
import AppDetailPage from './components/AppDetailPage';
import { APPS_DATA, TRANSLATIONS } from './constants';
import { VibeApp, AppCategory, SearchResult, Language, SortKey, SortDirection } from './types';
import { semanticSearch } from './services/openrouterService';

const CATEGORIES: AppCategory[] = ['Productivity & Tools', 'Design & Creative', 'AI & Experimental', 'Lifestyle & Niche'];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeCategory, setActiveCategory] = useState<AppCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<VibeApp | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });

  const t = TRANSLATIONS[lang];

  // Handle URL parameters for direct app links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('app');
    if (appId) {
      const app = APPS_DATA.find(a => a.id === appId);
      if (app) {
        setSelectedApp(app);
      }
    }
  }, []);

  // Update URL when app is selected
  const handleAppClick = (app: VibeApp) => {
    setSelectedApp(app);
    const url = new URL(window.location.href);
    url.searchParams.set('app', app.id);
    window.history.pushState({}, '', url.toString());
  };

  // Clear URL parameter when closing detail page
  const handleCloseDetail = () => {
    setSelectedApp(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('app');
    window.history.pushState({}, '', url.toString());
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredApps = useMemo(() => {
    let apps = [...APPS_DATA];

    // 1. Apply Search
    if (searchResults) {
      apps = searchResults.map(res => APPS_DATA.find(app => app.id === res.appId)).filter((app): app is VibeApp => !!app);
    } else if (searchQuery) {
      const q = searchQuery.toLowerCase();
      apps = apps.filter(app =>
        app.name.toLowerCase().includes(q) ||
        app.summary.toLowerCase().includes(q) ||
        app.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 2. Apply Category
    if (activeCategory !== 'All' && !searchResults) {
      apps = apps.filter(app => app.category === activeCategory);
    }

    // 3. Apply Sort
    apps.sort((a, b) => {
      let valA: any = a[sortConfig.key as keyof VibeApp] || '';
      let valB: any = b[sortConfig.key as keyof VibeApp] || '';

      if (sortConfig.key === 'source') {
        valA = a.githubUrl ? '1' : '0';
        valB = b.githubUrl ? '1' : '0';
      } else if (sortConfig.key === 'tags') {
        valA = a.tags.join(',');
        valB = b.tags.join(',');
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return apps;
  }, [activeCategory, searchQuery, searchResults, sortConfig]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    const results = await semanticSearch(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const SortArrow = ({ column }: { column: SortKey }) => {
    const isActive = sortConfig.key === column;
    return (
      <span className={`inline-block ml-1 transition-all ${isActive ? 'text-blue-600 opacity-100' : 'text-gray-300 opacity-40 group-hover:opacity-70'}`}>
        {isActive && sortConfig.direction === 'desc' ? '↓' : '↑'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header lang={lang} setLang={setLang} />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <nav className="border border-[#d0d7de] rounded-md overflow-hidden bg-[#f6f8fa] shadow-sm">
                <div className="px-4 py-3 border-b border-[#d0d7de] bg-gray-100">
                  <span className="font-semibold text-sm">{t.nav}</span>
                </div>
                <ul className="divide-y divide-[#d0d7de]">
                  <li>
                    <button
                      onClick={() => { setActiveCategory('All'); clearSearch(); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white ${activeCategory === 'All' ? 'bg-white font-bold border-l-4 border-blue-600' : ''}`}
                    >
                      {t.allApps}
                    </button>
                  </li>
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button
                        onClick={() => { setActiveCategory(cat); clearSearch(); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white ${activeCategory === cat ? 'bg-white font-bold border-l-4 border-blue-600' : ''}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-6">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full bg-[#1f2328] hover:bg-black text-white font-semibold py-2 px-4 rounded-md text-sm shadow-sm transition-all"
                >
                  {t.submit}
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">{activeCategory === 'All' ? t.headerTitle : activeCategory}</h2>
              <p className="text-gray-600 text-sm max-w-2xl">{t.headerDesc}</p>
            </div>

            <div className="mb-8 p-4 bg-[#f6f8fa] border border-[#d0d7de] rounded-md shadow-sm">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="block w-full pl-10 pr-3 py-2 border border-[#d0d7de] rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-[#f6f8fa] border border-[#d0d7de] px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isSearching ? 'Analyzing...' : t.searchBtn}
                </button>
                {searchResults && (
                  <button type="button" onClick={clearSearch} className="text-sm text-red-600 hover:underline px-2">{t.clear}</button>
                )}
              </form>
              <div className="mt-2 flex items-center space-x-2 text-[10px] text-gray-400 uppercase">
                <span className="inline-block bg-blue-100 text-blue-600 px-1 rounded">AI POWERED</span>
                <span>Semantic search identifies intent, not just keywords.</span>
              </div>
            </div>

            <div className="border border-[#d0d7de] rounded-md overflow-hidden shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d0d7de]">
                <thead className="bg-[#f6f8fa]">
                  <tr>
                    <th onClick={() => handleSort('name')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      {t.colName} <SortArrow column="name" />
                    </th>
                    <th onClick={() => handleSort('summary')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      {t.colSummary} <SortArrow column="summary" />
                    </th>
                    <th onClick={() => handleSort('tags')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      {t.colTags} <SortArrow column="tags" />
                    </th>
                    <th onClick={() => handleSort('creator')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      {t.colCreator} <SortArrow column="creator" />
                    </th>
                    <th onClick={() => handleSort('source')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      {t.colSource} <SortArrow column="source" />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#d0d7de]">
                  {filteredApps.length > 0 ? (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="github-table-row transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleAppClick(app)}
                            className="text-sm font-bold text-blue-600 hover:underline cursor-pointer text-left"
                          >
                            {app.name}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800 leading-relaxed max-w-xs md:max-w-md">
                            {app.summary}
                            {searchResults && searchResults.find(r => r.appId === app.id) && (
                              <div className="mt-1 text-xs text-green-600 italic font-medium">
                                ✨ Match: {searchResults.find(r => r.appId === app.id)?.relevance}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {app.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-700">{app.creator}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {app.githubUrl ? (
                            <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1f2328]" title="View Source">
                              <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.33-.27 2-.27.67 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                              </svg>
                            </a>
                          ) : (
                            <span className="text-gray-300 text-[10px] font-mono">{t.closedSource}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="bg-[#f6f8fa] px-6 py-3 border-t border-[#d0d7de] text-[10px] text-gray-500 flex justify-between">
                <span>{t.total}: {filteredApps.length} Apps</span>
                <span>{t.updated}: Mar 2024</span>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#d0d7de] text-center text-sm text-[#636c76]">
              <p>&copy; 2024 Vibe Hub. Independent Community Directory.</p>
              <div className="flex justify-center space-x-4 mt-4">
                <a href="#" className="hover:text-blue-600">ToS</a>
                <a href="#" className="hover:text-blue-600">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSubmitModal && <SubmitForm onClose={() => setShowSubmitModal(false)} lang={lang} />}
      {selectedApp && <AppDetailPage app={selectedApp} lang={lang} onClose={handleCloseDetail} />}
    </div>
  );
};

export default App;
