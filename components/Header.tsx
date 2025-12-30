
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  lang: Language;
  setLang: (l: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="bg-[#f6f8fa] border-b border-[#d0d7de] py-4 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Custom Bird Logo */}
          <svg className="h-8 w-8 text-[#1f2328]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 19l-1 3M14 19l1 3" />
            <path d="M12 19c3.314 0 6-2.686 6-6 0-3.314-2.686-6-6-6s-6 2.686-6 6c0 3.314 2.686 6 6 6z" fill="currentColor" fillOpacity="0.05" />
            <path d="M18 13l4-2M6 13l-4-2" />
            <path d="M12 7c0-2.209-1.791-4-4-4" />
            <circle cx="13" cy="11" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold leading-tight tracking-tight">Vibe Hub</h1>
            <p className="text-xs text-[#636c76]">The Directory for Vibe-Coded Innovations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-4 text-sm font-medium text-[#1f2328]">
            <a href="#" className="hover:text-blue-600">{t.explore}</a>
            <a href="#" className="hover:text-blue-600">{t.topics}</a>
            <a href="#" className="hover:text-blue-600">{t.docs}</a>
          </nav>

          <div className="flex items-center bg-white border border-[#d0d7de] rounded-md px-2 py-1 space-x-1 shadow-sm">
            <button 
              onClick={() => setLang('en')} 
              className={`text-[10px] px-1.5 py-0.5 rounded ${lang === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('zh-TW')} 
              className={`text-[10px] px-1.5 py-0.5 rounded ${lang === 'zh-TW' ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              繁
            </button>
            <button 
              onClick={() => setLang('zh-CN')} 
              className={`text-[10px] px-1.5 py-0.5 rounded ${lang === 'zh-CN' ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              简
            </button>
          </div>

          <button className="bg-[#1f2328] hover:bg-black text-white px-3 py-1.5 rounded-md text-sm transition-colors shadow-sm font-semibold">
            {t.join}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
