"use client";

import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import GridBackground from "@/components/ui/GridBackground";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-white">
        <div className="fixed inset-0 pointer-events-none z-0">
          <GridBackground opacity={0.04} size={40} />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main
            id="main-content"
            aria-label="Page content"
            className="flex-grow focus:outline-none flex flex-col"
            tabIndex={-1}
          >
            {/* <PageTransition> */}
            {children}
            {/* </PageTransition> */}
          </main>
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
}
