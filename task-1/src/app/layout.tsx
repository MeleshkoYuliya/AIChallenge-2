import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import FeedbackButton from "./components/FeedbackButton";

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
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>
        {children}
        <Footer />
        <FeedbackButton />
      </body>
    </html>
  );
}
