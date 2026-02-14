# Berztech 2.0

A high-performance, design-driven portfolio website built for Berztech, showcasing engineering excellence and digital innovation.

## 🚀 Tech Stack

- **Framework**: [Next.js 16.1](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Feather)

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── features/         # Feature-specific components (e.g., work, blog)
│   ├── layout/           # Global layout (Header, Footer)
│   ├── sections/         # Landing page sections (Hero, Services)
│   └── ui/               # Reusable UI primitives (Buttons, CornerFrame)
├── data/                 # Static content data (marketing, projects)
├── lib/                  # Utilities and Design Tokens
├── assets/               # Bundled assets (Logos, Icons)
└── public/               # Static assets (Content images)
```

## 🎨 Design System

We use a centralized design token system located in `src/lib/design-tokens.js`.

### Typography
- **Headings**: `font-space-grotesk` (Sans)
- **Body/Code**: `font-jetbrains-mono` (Mono)

### Colors
Service-specific color identities:
- **Web Development**: Blue
- **Growth**: Emerald
- **Mobile**: Purple
- **Branding**: Rose

### Usage Example
```javascript
import { typography, serviceColors } from "@/lib/design-tokens";

<h1 className={`${typography.fontFamily.sans} ${serviceColors.blue.text}`}>
  Hello World
</h1>
```

## 🛠️ Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```
