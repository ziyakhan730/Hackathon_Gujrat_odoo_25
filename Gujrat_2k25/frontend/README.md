# QuickCourt - Local Sports Booking Platform

A premium Gen-Z aesthetic sports booking platform built with React, TypeScript, and Tailwind CSS. Book courts instantly, join matches, and connect with your local sports community.

## 🚀 Features

- **Instant Booking**: Find and book sports facilities in seconds
- **Match Making**: Join games or create your own matches
- **Glassmorphism Design**: Modern Gen-Z aesthetic with neon accents
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: WCAG 2.1 AA compliant with keyboard navigation
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Real-time Updates**: Live availability and match updates

## 🏆 Sports Supported

- Badminton
- Football
- Tennis
- Cricket
- Basketball
- Table Tennis

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router
- **Maps**: React Leaflet (configured)

## 🎨 Design System

- **Primary**: Violet (#7C3AED) with cyan accents (#22D3EE)
- **Typography**: Inter (body) + Outfit (headings)
- **Style**: Glassmorphism cards, soft shadows, rounded corners
- **Dark Mode**: Default theme with light mode toggle

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd quickcourt

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📱 Pages & Features

### 🏠 Home Page
- Hero section with animated gradient background
- Smart search with location and sport filters
- Featured facilities carousel
- Interactive stats and sports grid

### 🔍 Explore Facilities
- Advanced filtering (sport, location, price, availability)
- List and map view toggle
- Real-time availability badges
- Facility cards with hover animations

### 🏟️ Facility Details
- Image gallery with lightbox
- Amenities and reviews
- Day calendar with 30-min slots
- Floating booking drawer

### 🤝 Matches
- Find nearby matches by skill level
- Create and join competitive games
- Match details with chat functionality
- Player profiles and ratings

### 👤 Profile
- Booking history and match records
- Favorite facilities
- Editable profile with achievements
- Settings and preferences

## 🎯 Accessibility Features

- **Keyboard Navigation**: Full tab/arrow key support
- **Focus Management**: Visible focus rings
- **ARIA Labels**: Comprehensive screen reader support
- **Color Contrast**: WCAG AA compliant
- **Reduced Motion**: Respects user preferences

## 🌈 Animation & UX

- **Page Transitions**: Smooth fade + slide motions
- **Hover Effects**: Scale, glow, and lift interactions
- **Loading States**: Skeleton loaders and spinners
- **Micro-interactions**: Button press springs, icon rotations
- **Confetti**: Success celebrations (with reduced motion support)

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Header, Footer, Layout
├── pages/              # Route components
├── assets/             # Images and static files
├── hooks/              # Custom React hooks
└── lib/                # Utilities and configs
```

## 🔧 Environment Variables

```env
VITE_API_URL=http://localhost:3000/api  # Backend API URL (optional)
```

## 📊 Performance

- **Lighthouse Scores**: 90+ Performance, 95+ Accessibility
- **Code Splitting**: Route-level lazy loading
- **Image Optimization**: WebP support with fallbacks
- **Bundle Size**: Optimized with tree-shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: hello@quickcourt.com
- GitHub Issues: [Create an issue](https://github.com/quickcourt/issues)

---

Built with ❤️ by the QuickCourt team