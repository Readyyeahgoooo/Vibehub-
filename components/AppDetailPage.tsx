import React from 'react';
import { VibeApp, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AppDetailPageProps {
  app: VibeApp;
  lang: Language;
  onClose: () => void;
}

const AppDetailPage: React.FC<AppDetailPageProps> = ({ app, lang, onClose }) => {
  const t = TRANSLATIONS[lang];
  const shareUrl = `${window.location.origin}${window.location.pathname}?app=${app.id}`;

  const handleShare = async (platform: 'twitter' | 'copy') => {
    const text = `Check out ${app.name} on Vibe Hub!`;
    
    if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl border border-[#d0d7de] my-8">
        {/* Header */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {app.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-xl">{app.name}</h2>
              <p className="text-sm text-gray-600">{app.category}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#636c76] hover:text-[#1f2328] transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">About</h3>
            <p className="text-gray-700 leading-relaxed">{app.summary}</p>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {app.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Creator */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Creator</h3>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {app.creator.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{app.creator}</p>
                <p className="text-sm text-gray-600">Vibe Coder</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Links</h3>
            <div className="space-y-2">
              {app.githubUrl && (
                <a 
                  href={app.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.33-.27 2-.27.67 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">View Source Code</span>
                  <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              )}
              {app.threadsUrl && (
                <a 
                  href={app.threadsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">View on Threads</span>
                  <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Share Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Share this App</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
                <span className="text-sm font-medium">Share on Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium">Copy Link</span>
              </button>
            </div>
            
            {/* Shareable URL Display */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Shareable Link:</p>
              <code className="text-xs text-blue-600 break-all">{shareUrl}</code>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Category: {app.category}</span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Vibe Coded</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f6f8fa] border-t border-[#d0d7de] px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Built with AI-assisted vibe coding ✨
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1f2328] hover:bg-black text-white rounded-md text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDetailPage;
