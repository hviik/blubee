# Blubeez - Your Travel Assistant

A beautiful Next.js website converted from Figma design, featuring a modern travel planning interface.

## Features

- 🎨 Pixel-perfect conversion from Figma design
- ⚡ Built with Next.js 14 and React
- 💅 Styled with Tailwind CSS
- 🔤 Custom fonts: Bricolage Grotesque and Poppins
- 📱 Responsive and interactive UI
- 🖼️ Optimized image loading with Next.js Image component

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
blubeez/
├── app/
│   ├── globals.css       # Global styles and Tailwind directives
│   ├── layout.tsx        # Root layout with font configuration
│   └── page.tsx          # Main home page component
├── public/
│   └── assets/           # Image and SVG assets from Figma
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Design Structure

The page follows the exact structure from Figma with these main sections:

- **Header**: Navigation with logo, About, Log in, and Sign up buttons
- **Logo Section**: Main blubeez logo and introductory text
- **Prompts Section**: Sample travel planning prompts
- **Ask Section**: Input field for user queries
- **Footer**: Explore and Help buttons with terms and privacy information

## Technologies Used

- **Next.js 14**: React framework for production
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Next.js Image**: Optimized image component
- **Google Fonts**: Bricolage Grotesque and Poppins fonts

## Build for Production

```bash
npm run build
npm start
```

## License

This project is for demonstration purposes.

