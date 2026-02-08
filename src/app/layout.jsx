import RootLayout from "@/components/layout/RootLayout";
import "./globals.css";

export const metadata = {
  title: {
    template: "%s - Berztech Inc.",
    default: "Berztech Inc. - Engineering Digital Excellence",
  },
  description: "Boutique development agency specializing in high-end web applications and digital transformation.",
};

export default function Layout({ children }) {
  return (
    <html
      lang="en"
      className="h-full bg-neutral-950 text-base antialiased"
    >
      <body className="flex min-h-full flex-col bg-neutral-950">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}