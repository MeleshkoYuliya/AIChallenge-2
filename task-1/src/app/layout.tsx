import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Navigation from "./components/Navigation";

export const metadata: Metadata = {
  title: "Company Leader Board 2025",
  description: "Company Leader Board 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
