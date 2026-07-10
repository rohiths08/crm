import { Hexagon, Moon, Sun, User, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface HeaderProps {
  user: { email: string } | null
  activeTab: 'home' | 'upload'
  onNavClick: (tab: 'home' | 'upload', sectionId?: string) => void
  onLoginClick: () => void
  onLogout: () => void
}

export function Header({ user, activeTab, onNavClick, onLoginClick, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button onClick={() => onNavClick('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
          <Hexagon className="h-6 w-6 text-black dark:text-white" fill="currentColor" />
          <span className="text-xl font-bold tracking-tight text-black dark:text-white">GrowEasy</span>
        </button>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <button 
            onClick={() => onNavClick('home')} 
            className={`hover:text-black dark:hover:text-white transition-colors ${
              activeTab === 'home' ? 'text-black dark:text-white font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavClick('home', 'features')} 
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => onNavClick('home', 'solution')} 
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            Solution
          </button>
          <button 
            onClick={() => onNavClick('home', 'about')} 
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            About Us
          </button>
          <button 
            onClick={() => onNavClick('upload')} 
            className={`hover:text-black dark:hover:text-white transition-colors ${
              activeTab === 'upload' ? 'text-black dark:text-white font-semibold' : ''
            }`}
          >
            Upload Files
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {mounted && (
            user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1.5 text-sm text-black dark:text-white">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="rounded-full p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="rounded-lg bg-black dark:bg-white px-4 py-1.5 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Login
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
