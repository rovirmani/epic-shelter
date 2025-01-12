import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 w-full">
      <div className="w-full px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            2025 Epic Shelter. All rights reserved.
          </div>
          
          <div className="flex space-x-6">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
