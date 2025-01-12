import React from 'react';
import { Home, Database, Settings, Users, Database as DatabaseIcon } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';

export function TopNav() {
  const navItems = [
    { name: 'Home', icon: Home, current: false },
    { name: 'Migrations', icon: Database, current: true },
    { name: 'Databases', icon: DatabaseIcon, current: false },
    { name: 'Team', icon: Users, current: false },
    { name: 'Settings', icon: Settings, current: false },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 w-full">
      <div className="w-full px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-black tracking-tight font-mono text-purple-600 dark:text-purple-400">Epic Shelter</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    item.current
                      ? 'border-b-2 border-purple-500 text-gray-900 dark:text-white'
                      : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </a>
              ))}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="h-8 w-8 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white font-medium">
                RV
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
