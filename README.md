# SwiftFacture

**Fast. Professional. Effortless.**

SwiftFacture is a modern invoice and receipt generator built with React. Create professional invoices, estimates, and receipts in seconds with beautiful templates, multi-language support, and client-side PDF generation.

![SwiftFacture](public/assets/logo/SwiftFactureLogo.png)

## ✨ Features

### 🧾 **Invoice & Receipt Generation**
- Professional invoice templates with live preview
- Receipt generation with customizable layouts
- Estimate creation and conversion to invoices
- PDF export with print-optimized output
- Auto-calculation of taxes, totals, and currency

### 🌍 **Multi-Language Support**
- **French (Default)** and **English** interfaces
- Real-time language switching
- Persistent language preferences
- Complete UI translation including:
  - Navigation and buttons
  - Form labels and placeholders
  - Premium plans and features
  - Authentication pages

### 🎨 **Modern UI/UX**
- 10+ professional invoice templates
- Responsive design for all devices
- Dark/light theme support
- Smooth animations and transitions
- Loading states and error handling

### 💼 **Business Features**
- Customer management
- Multiple template options (Template1-Template10)
- Premium service tiers
- User authentication system
- Local data storage (browser-based)

### 🔒 **Privacy-First**
- All data stored locally in browser
- No server-side data collection
- Client-side PDF generation
- Export/share only when you choose

## 🚀 Quick Start

### Prerequisites
- Node.js (16+ recommended)
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Griffin250/PayFlow2.git
cd SwiftFacture

# Install dependencies
npm install

# Install i18n dependencies (if not already installed)
npm install react-i18next i18next i18next-browser-languagedetector

# Start development server
npm run dev
```

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

### **Internationalization**
- **react-i18next** - React integration for i18next
- **i18next** - Internationalization framework
- **i18next-browser-languagedetector** - Language detection

### **PDF Generation**
- **jsPDF** - Client-side PDF generation
- **html2canvas** - HTML to canvas rendering

## 📁 Project Structure

```
SwiftFacture/
├── public/
│   ├── assets/
│   │   ├── icons/          # Flag icons for language switching
│   │   ├── logo/           # SwiftFacture branding assets
│   │   └── template*.png   # Template preview images
├── src/
│   ├── components/
│   │   ├── templates/      # Invoice/Receipt templates
│   │   ├── ui/            # Reusable UI components
│   │   ├── Header.jsx     # Main navigation with i18n
│   │   └── ...
│   ├── pages/
│   │   ├── About.jsx      # About page (translated)
│   │   ├── Premium.jsx    # Premium plans (translated)
│   │   ├── Login.jsx      # Authentication (translated)
│   │   └── ...
│   ├── i18n/
│   │   ├── index.js       # i18n configuration
│   │   └── resources/     # Translation files
│   │       ├── fr/        # French translations
│   │       └── en/        # English translations
│   ├── hooks/
│   │   └── useLanguage.js # Custom language management hook
│   ├── utils/
│   │   ├── pdfGenerator.js
│   │   └── templateRegistry.js
│   └── ...
├── components.json        # shadcn/ui configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.js         # Vite configuration
```

## 🌐 Multi-Language Implementation

SwiftFacture supports French (default) and English with a robust i18n setup:

### **Language Features:**
- 🇫🇷 **French**: Complete native translation
- 🇺🇸 **English**: Professional English translation
- 🔄 **Real-time switching**: Via header dropdown
- 💾 **Persistent preferences**: Saved in localStorage
- 🛡️ **Fallback system**: Graceful handling of missing translations

### **Translated Pages:**
- ✅ Navigation and Header
- ✅ Premium Plans & Pricing
- ✅ About Page & FAQ
- ✅ Authentication (Login/Register)
- ✅ All UI Components

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Development variations
npm run build:dev    # Development build
```

## 🎯 Usage Guide

### **Creating an Invoice:**
1. Navigate to Invoice page
2. Select a template
3. Fill in customer details
4. Add line items with descriptions and amounts
5. Preview and export as PDF

### **Language Switching:**
1. Click the language dropdown in header
2. Select French (🇫🇷) or English (🇺🇸)
3. Interface updates immediately
4. Preference saved automatically

### **Premium Features:**
- Multiple subscription tiers (Free, Starter, Pro, Growth)
- Advanced template options
- Priority support
- Enhanced features

## 🔧 Configuration

### **Adding New Languages:**
1. Create new translation file: `src/i18n/resources/[lang]/common.json`
2. Add language to i18n config: `src/i18n/index.js`
3. Add flag icon: `public/assets/icons/[lang]Flag.png`
4. Update language dropdown in Header component

### **Customizing Templates:**
Templates are located in `src/components/templates/`. Each template is a React component with:
- Professional styling
- Print optimization
- Dynamic data binding
- Currency formatting

## 🚀 Deployment

### **Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Netlify:**
```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### **Other Platforms:**
The project generates static files that can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first styling approach
- **shadcn/ui** - For beautiful, accessible components
- **Vercel** - For excellent deployment platform

---

**Made with ❤️ by Griffin250**

*SwiftFacture - Fast. Professional. Effortless.* 