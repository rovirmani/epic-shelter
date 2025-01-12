import React from 'react';
import { TopNav } from "../navigation/TopNav";
import { Footer } from "../navigation/Footer";

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-purple-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-screen max-w-[100vw]">
      <TopNav />
      
      <div className="flex-1 w-full">
        <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50 dark:border-gray-800">
          <div className="w-full flex h-16 items-center px-8">
            <h1 className="text-xl sm:text-2xl font-semibold font-sans bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
              Database Migration Dashboard
            </h1>
          </div>
        </header>
        
        <main className="w-full px-8 py-6">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
