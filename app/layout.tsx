import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auth App",
  description: "Next.js + Supabase Auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50`}
      >
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white/50 backdrop-blur-sm mt-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 text-center sm:text-left">
                © {new Date().getFullYear()} Auth App. Built with Next.js & Supabase.
              </p>
              <div className="flex gap-6 text-sm text-gray-600">
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}