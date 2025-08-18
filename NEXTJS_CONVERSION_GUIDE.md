# 🚀 Next.js Conversion Guide

This guide outlines the complete process of converting the SafarBot project from React/Vite to Next.js while maintaining the Chisfis design system.

## 📋 Prerequisites

- Node.js 18+ installed
- Basic understanding of Next.js
- Current SafarBot project working

## 🎯 Conversion Benefits

### Performance Improvements
- **Server-Side Rendering (SSR)**: Better SEO and initial load times
- **Static Site Generation (SSG)**: Faster page loads for static content
- **Image Optimization**: Automatic image optimization with `next/image`
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Built-in bundle analyzer

### Developer Experience
- **File-based Routing**: No need for React Router
- **API Routes**: Built-in API endpoints
- **TypeScript Support**: First-class TypeScript support
- **Hot Reloading**: Fast development experience
- **Built-in Optimizations**: Automatic optimizations

## 🔄 Step-by-Step Conversion

### 1. Create New Next.js Project

```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest safarbot-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd safarbot-nextjs
```

### 2. Install Dependencies

```bash
# Install required dependencies
npm install framer-motion lucide-react react-datepicker @types/react-datepicker @headlessui/react

# Install development dependencies
npm install -D @types/node
```

### 3. Project Structure

```
safarbot-nextjs/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── flights/
│   │   │   └── page.tsx       # Flights page
│   │   ├── hotels/
│   │   │   └── page.tsx       # Hotels page
│   │   ├── login/
│   │   │   └── page.tsx       # Login page
│   │   ├── signup/
│   │   │   └── page.tsx       # Signup page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   ├── Header.tsx        # Header component
│   │   └── Footer.tsx        # Footer component
│   ├── contexts/             # React contexts
│   ├── services/             # API services
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

### 4. Configure Tailwind CSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Copy the entire theme configuration from current project
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Copy all color definitions
        primary: {
          50: '#E6F3FF',
          100: '#CCE7FF',
          // ... rest of the colors
        },
        // ... rest of the color palette
      },
      // ... rest of the theme configuration
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### 5. Set Up Global Styles

```css
/* src/app/globals.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Copy all the global styles from current project */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text;
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
  }
  
  /* ... rest of the base styles */
}

@layer components {
  /* Copy all component styles */
  .btn-primary {
    @apply bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-medium hover:shadow-large transform hover:-translate-y-0.5;
  }
  
  /* ... rest of the component styles */
}

@layer utilities {
  /* Copy all utility styles */
}
```

### 6. Create Root Layout

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'SafarBot - AI Travel Planning',
  description: 'AI-powered travel planning and booking platform',
  keywords: ['travel', 'booking', 'flights', 'hotels', 'AI'],
  authors: [{ name: 'SafarBot Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1E90FF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 7. Convert Pages to App Router

#### Home Page
```tsx
// src/app/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Plane, Search, Star, Users, Globe } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    departureDate: null as Date | null,
    returnDate: null as Date | null,
    passengers: 1,
    tripType: 'round-trip'
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to flights page with search params
    const params = new URLSearchParams({
      from: searchForm.from,
      to: searchForm.to,
      departure: searchForm.departureDate?.toISOString() || '',
      return: searchForm.returnDate?.toISOString() || '',
      passengers: searchForm.passengers.toString(),
      tripType: searchForm.tripType
    })
    router.push(`/flights?${params.toString()}`)
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-chisfis">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-secondary-900 dark:text-dark-text mb-6">
              Plan Your Perfect
              <span className="text-gradient"> Journey</span>
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto text-body">
              AI-powered travel planning that makes booking flights and hotels effortless. 
              Discover amazing destinations and get the best deals.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8" shadow="large">
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Trip Type Selector */}
                <div className="flex items-center justify-center space-x-4">
                  <label className={`flex items-center px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                    searchForm.tripType === 'one-way' 
                      ? 'border-primary-500 bg-primary-50 text-primary-600' 
                      : 'border-secondary-300 bg-white dark:bg-dark-card text-secondary-600 dark:text-secondary-300'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="one-way"
                      checked={searchForm.tripType === 'one-way'}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, tripType: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="font-medium">One Way</span>
                  </label>
                  <label className={`flex items-center px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                    searchForm.tripType === 'round-trip' 
                      ? 'border-primary-500 bg-primary-50 text-primary-600' 
                      : 'border-secondary-300 bg-white dark:bg-dark-card text-secondary-600 dark:text-secondary-300'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="round-trip"
                      checked={searchForm.tripType === 'round-trip'}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, tripType: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="font-medium">Round Trip</span>
                  </label>
                </div>

                {/* Search Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      From
                    </label>
                    <input
                      type="text"
                      value={searchForm.from}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, from: e.target.value }))}
                      placeholder="Departure city"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      To
                    </label>
                    <input
                      type="text"
                      value={searchForm.to}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="Destination city"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Departure
                    </label>
                    <DatePicker
                      selected={searchForm.departureDate}
                      onChange={(date: Date) => setSearchForm(prev => ({ ...prev, departureDate: date }))}
                      className="input-field"
                      placeholderText="Select date"
                      minDate={new Date()}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      {searchForm.tripType === 'round-trip' ? 'Return' : 'Passengers'}
                    </label>
                    {searchForm.tripType === 'round-trip' ? (
                      <DatePicker
                        selected={searchForm.returnDate}
                        onChange={(date: Date) => setSearchForm(prev => ({ ...prev, returnDate: date }))}
                        className="input-field"
                        placeholderText="Select date"
                        minDate={searchForm.departureDate || new Date()}
                        required
                      />
                    ) : (
                      <select
                        value={searchForm.passengers}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                        className="input-field"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  icon={Search}
                  size="lg"
                  className="w-full"
                >
                  Search Flights
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Rest of the sections... */}
    </div>
  )
}
```

### 8. Convert API Services

```tsx
// src/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const flightAPI = {
  searchFlights: async (searchRequest: FlightSearchRequest): Promise<FlightSearchResponse> => {
    const response = await fetch(`${API_BASE_URL}/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchRequest),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },
  
  // ... rest of the API methods
}
```

### 9. Set Up Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=SafarBot
```

### 10. Configure Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-api-domain.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

## 🔧 Component Migration

### Update Imports
```tsx
// Old React Router imports
import { useNavigate, Link } from 'react-router-dom'

// New Next.js imports
import { useRouter } from 'next/navigation'
import Link from 'next/link'
```

### Update Navigation
```tsx
// Old React Router navigation
const navigate = useNavigate()
navigate('/flights')

// New Next.js navigation
const router = useRouter()
router.push('/flights')
```

### Update Links
```tsx
// Old React Router Link
<Link to="/flights">Flights</Link>

// New Next.js Link
<Link href="/flights">Flights</Link>
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

### Other Platforms
- **Netlify**: Use `next build && next export` for static export
- **AWS Amplify**: Connect GitHub repository
- **Railway**: Deploy with Docker

## 📊 Performance Optimizations

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  className="rounded-xl"
/>
```

### Font Optimization
```tsx
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})
```

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic'

const DatePicker = dynamic(() => import('react-datepicker'), {
  ssr: false,
  loading: () => <div className="h-10 bg-secondary-200 rounded-xl animate-pulse" />
})
```

## 🔍 SEO Optimization

### Metadata
```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SafarBot - AI Travel Planning',
  description: 'AI-powered travel planning and booking platform',
  openGraph: {
    title: 'SafarBot - AI Travel Planning',
    description: 'AI-powered travel planning and booking platform',
    images: ['/og-image.jpg'],
  },
}
```

### Structured Data
```tsx
// Add to layout or pages
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "SafarBot",
      "description": "AI-powered travel planning platform"
    })
  }}
/>
```

## 🧪 Testing

### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Component Testing
```tsx
// __tests__/HomePage.test.tsx
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders hero section', () => {
    render(<HomePage />)
    expect(screen.getByText(/Plan Your Perfect/)).toBeInTheDocument()
  })
})
```

## 📈 Analytics

### Google Analytics
```tsx
// src/app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 🎯 Migration Checklist

### ✅ Setup
- [ ] Create Next.js project
- [ ] Install dependencies
- [ ] Configure Tailwind CSS
- [ ] Set up TypeScript
- [ ] Configure ESLint

### ✅ Components
- [ ] Migrate UI components
- [ ] Update imports
- [ ] Fix navigation
- [ ] Update routing
- [ ] Test components

### ✅ Pages
- [ ] Convert all pages to App Router
- [ ] Update metadata
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Test page functionality

### ✅ API Integration
- [ ] Update API services
- [ ] Configure environment variables
- [ ] Set up API routes (if needed)
- [ ] Test API integration

### ✅ Performance
- [ ] Optimize images
- [ ] Implement lazy loading
- [ ] Add caching strategies
- [ ] Monitor performance

### ✅ Deployment
- [ ] Configure build settings
- [ ] Set up environment variables
- [ ] Deploy to platform
- [ ] Test production build

## 🚀 Benefits After Migration

1. **Better SEO**: Server-side rendering improves search engine visibility
2. **Faster Loading**: Automatic code splitting and optimizations
3. **Better UX**: Improved performance and loading states
4. **Easier Maintenance**: Built-in features reduce boilerplate
5. **Scalability**: Better architecture for growth
6. **Developer Experience**: Hot reloading and better tooling

---

This migration will significantly improve the performance, SEO, and maintainability of your SafarBot application while preserving the beautiful Chisfis design system.
