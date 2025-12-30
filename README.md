<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Vibe Hub - Directory for Vibe-Coded Apps

A professional GitHub-style directory showcasing vibe-coded applications built with AI assistance. Features AI-powered semantic search, multi-language support (English, Traditional Chinese, Simplified Chinese), and a secure community submission system with AI-powered verification.

## ✨ Features

- 🔍 **AI-Powered Semantic Search** - Find apps by intent, not just keywords
- 🤖 **AI Screenshot Verification** - Automated ownership verification using vision AI
- 🌐 **Multi-language Support** - English, Traditional Chinese (繁體), Simplified Chinese (简体)
- 🔒 **Secure Submission System** - Rate limiting, input sanitization, malicious link detection
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **GitHub-inspired UI** - Professional and familiar interface
- 🚀 **Fast & Lightweight** - Built with React + Vite
- 💰 **Free Deployment** - Deploy to GitHub Pages or Vercel for $0/month

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenRouter API key (free at https://openrouter.ai/keys)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/vibe-hub.git
cd vibe-hub

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenRouter API key

# 4. Run development server
npm run dev

# 5. Open http://localhost:5173
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

## 📦 Deployment

### Option 1: GitHub Pages (Recommended - Free)

See detailed instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Deploy:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Enable GitHub Pages in repository settings
# Settings → Pages → Source: GitHub Actions

# 3. Done! Your site will be live at:
# https://YOUR_USERNAME.github.io/vibe-hub
```

### Option 2: Vercel (Alternative - Free)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Add environment variable in Vercel dashboard
# VITE_OPENROUTER_API_KEY=your_key_here

# 4. Done! Your site will be live at:
# https://vibe-hub.vercel.app
```

## 🏗️ Project Structure

```
vibe-hub/
├── .github/workflows/     # GitHub Actions for deployment
├── .kiro/specs/          # Feature specifications
├── api/                  # API type definitions
├── components/           # React components
│   ├── Header.tsx
│   └── SubmitForm.tsx
├── services/            # API services
│   ├── openrouterService.ts    # AI search
│   └── verificationService.ts  # AI verification
├── utils/               # Utility functions
│   ├── urlValidator.ts         # URL validation
│   ├── sanitizer.ts           # Input sanitization
│   └── rateLimiter.ts         # Rate limiting
├── workers/             # Cloudflare Workers (optional)
├── tests/              # Test files
├── App.tsx             # Main application
├── DEPLOYMENT.md       # Deployment guide
└── IMPLEMENTATION_STATUS.md  # Progress tracker
```

## 🔒 Security Features

- ✅ **API Key Protection** - Keys never exposed in client code
- ✅ **AI-Powered Verification** - Screenshot ownership verification
- ✅ **Malicious Link Detection** - Domain allowlist/blocklist
- ✅ **Rate Limiting** - Prevent abuse (3 submissions/24h per IP)
- ✅ **Input Sanitization** - XSS prevention
- ✅ **HTTPS Enforcement** - All requests encrypted

## 🧪 Testing

This project uses property-based testing for comprehensive correctness validation:

- **Vitest** - Fast unit testing
- **fast-check** - Property-based testing
- **14 Correctness Properties** - Formal specifications

Example test:
```typescript
// Property: API keys should never appear in client code
it('should not expose API keys in client bundle', () => {
  const envKeys = Object.keys(import.meta.env);
  const nonViteKeys = envKeys.filter(key => !key.startsWith('VITE_'));
  expect(nonViteKeys).toEqual([]);
});
```

## 💰 Cost Breakdown

### GitHub Pages Deployment
- **GitHub Pages**: Free (100GB bandwidth/month)
- **OpenRouter API**: ~$0-1/month (pay-per-use)
- **Total**: $0-1/month 🎉

### Vercel Deployment
- **Vercel Hosting**: Free (100GB bandwidth)
- **OpenRouter API**: ~$0-1/month (pay-per-use)
- **Total**: $0-1/month 🎉

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Development progress
- [.kiro/specs/](./kiro/specs/) - Feature specifications

## 🤝 Contributing

This is a community project! To add your vibe-coded app:

1. Click "Submit Vibe App" button
2. Fill in your app details
3. Upload verification screenshot (shows your username)
4. AI verifies ownership automatically
5. Submit for review

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **AI**: OpenRouter API (GPT-4o-mini for vision)
- **Testing**: Vitest + fast-check
- **Deployment**: GitHub Pages or Vercel
- **Styling**: Inline CSS (GitHub-inspired)

## 📄 License

MIT License - feel free to use this for your own projects!

## 🆘 Support

- **Deployment Help**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **OpenRouter API**: https://openrouter.ai/docs
- **Issues**: Create an issue on GitHub
- **Community**: Join discussions in the Issues tab

## 🎯 Roadmap

- [x] AI-powered semantic search
- [x] Multi-language support
- [x] Security utilities (validation, sanitization, rate limiting)
- [x] Property-based testing framework
- [ ] AI screenshot verification (in progress)
- [ ] Backend API endpoints
- [ ] Admin approval workflow
- [ ] App detail pages with galleries
- [ ] Social sharing features

---

**Built with ❤️ using AI-assisted "vibe coding"**

