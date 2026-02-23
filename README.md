# Zenith X | The Ultimate Sound

![Zenith X Preview](https://img.shields.io/badge/Status-Live-success?style=for-the-badge&color=d4af37)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Motion-React-black?style=for-the-badge&logo=framer)

A luxurious, high-performance landing page for a premium headphone brand, **Zenith X**. This project showcases advanced scroll-linked animations, a 144-frame HTML5 Canvas sequence, and a meticulously crafted dark/thin-beige aesthetic.

## ✨ Features

- **144-Frame Canvas Animation**: A buttery-smooth, scroll-bound 3D headphone sequence rendered on an HTML5 `<canvas>`.
- **Smooth Scrolling**: Powered by [Lenis](https://lenis.darkroom.engineering/) for a premium, weightless scrolling experience.
- **Scroll-Linked Typography**: Text reveals and opacity fades perfectly synced to the user's scroll position using `motion/react`.
- **Luxurious Aesthetic**: A bespoke dark mode theme featuring custom beige (`#d4c5b9`) and metallic gold (`#d4af37`) accents.
- **Fully Responsive**: Flawless layout and typography scaling from mobile devices to ultra-wide desktop monitors.
- **Premium Interactions**: Custom hover states, slow-zoom image reveals, and metallic gradient text clipping.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion for React](https://motion.dev/) (formerly Framer Motion)
- **Scroll Engine**: [Lenis](https://github.com/darkroomengineering/lenis)
- **Typography**: Google Fonts (Cinzel & Inter)

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed. This project uses [pnpm](https://pnpm.io/) as the package manager.

```bash
npm install -g pnpm
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/zenith-x-landing.git
   cd zenith-x-landing
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 📁 Project Structure

- `src/App.tsx`: The core application logic, containing the Lenis setup, Canvas rendering loop, and all UI sections.
- `src/index.css`: Global styles, Tailwind v4 `@theme` configuration, and custom scrollbar hiding.
- `public/headphone-seqs/`: Contains the 144 individual `.png` frames used for the scroll animation.
- `public/`: Contains static assets like the craftsmanship images (`headphone-ear-pads.png`, `headphone-seamless.png`).

## 🎨 Design System

- **Primary Dark**: `#050505` / `#0a0a0a`
- **Signature Beige**: `#d4c5b9`
- **Deep Beige**: `#a89b90`
- **Metallic Gold**: `from-[#d4af37] via-[#f9e596] to-[#d4af37]`
- **Headings**: Cinzel (Serif)
- **Body**: Inter (Sans-serif)

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

_Designed and built with precision._
