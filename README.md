# Berztech 2.0

A high-performance, design-driven portfolio and client management platform built for Berztech, showcasing engineering excellence and digital innovation.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Feather)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin portal (Dashboard, Requests, Global Board)
│   ├── dashboard/        # Client portal (Client Dashboard)
│   ├── track/            # Client request tracking & board
│   ├── auth/             # Authentication pages (Login)
│   └── (public pages)    # Landing, Work, Blog, etc.
├── components/           # React components
│   ├── admin/            # Admin-specific components (Kanban, DataTable)
│   ├── client/           # Client-specific components
│   ├── features/         # Feature-specific components (e.g., work, blog)
│   ├── layout/           # Global layout (Header, Footer)
│   ├── sections/         # Landing page sections (Hero, Services)
│   └── ui/               # Reusable UI primitives (Buttons, CornerFrame)
├── config/               # Configuration files (Stats, Colors, Layout)
├── data/                 # Static content data (Marketing, Projects)
├── lib/                  # Utilities, Supabase client, and Design Tokens
└── public/               # Static assets (Images, Fonts)
```

## 🎨 Design System

We use a strictly enforced centralized design token system located in `src/lib/design-tokens.js` and detailed in `DESIGN_SYSTEM.md`.

### Key Principles
- **Tokens First**: Never hardcode colors, spacing, or typography. Always use `design-tokens.js`.
- **Card UI**: All structural cards must be framed using the `<CornerFrame>` component.
- **Mobile-First**: Every page is fully responsive (375px → 1024px+).
- **Icons**: Strictly limited to `react-icons/fi` (Feather Icons).

### Typography
- **Headings**: `font-space-grotesk` (Sans)
- **Body/Code**: `font-jetbrains-mono` (Mono)

### Colors
Service-specific color identities:
- **Web Development**: Blue (`serviceColors.blue`)
- **Growth**: Emerald (`serviceColors.emerald`)
- **Mobile**: Purple (`serviceColors.purple`)
- **Branding**: Rose (`serviceColors.rose`)

## 🛠️ Getting Started

### Prerequisites
You will need a Supabase project set up with the appropriate database schema (tables: `requests`, `tasks`, `task_comments`, `profiles`, `projects`, etc.) and Authentication enabled.

### 1. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Build for production
```bash
npm run build
npm start
```
