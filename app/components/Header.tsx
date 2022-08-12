import Link from 'next/link'
import { useTheme } from 'next-themes'

import { IconButton, IconButtonClasses } from './IconButton'
import { ThemeIconLight } from './Icons/ThemeIconLight'
import { ThemeIconDark } from './Icons/ThemeIconDark'
import { Logo } from './Icons/Logo'
import { useEffect, useState } from 'react'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const delayMountThemeButton = 1000
export function Header() {
  const { theme, setTheme } = useTheme()
  const [themeButtonVisible, setThemeButtonVisible] = useState(false)
  const [scrolledPastHeader, setScrollPastHeader] = useState(false)

  const scrolled = scrolledPastHeader

  function toggleTheme() {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setThemeButtonVisible(true)
    }, delayMountThemeButton)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !scrolledPastHeader) {
        setScrollPastHeader(true)
      }
      if (window.scrollY <= 50 && scrolledPastHeader) {
        setScrollPastHeader(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolledPastHeader])

  return (
    <header
      className={`sticky top-0 backdrop-blur w-full z-40 border-b transition-all ${
        scrolled
          ? 'bg-white supports-backdrop-blur:bg-white/95 border-slate-300 dark:border-slate-700 dark:bg-slate-900/75'
          : 'bg-white/95 supports-backdrop-blur:bg-white/60 border-transparent dark:bg-transparent '
      }`}
    >
      <div className="max-w-8xl mx-auto">
        <div className="px-4 h-14 flex items-center sm:px-6">
          <div className="flex items-center justify-between w-full">
            <div className="mr-auto text-2xl">
              <Link href="/" passHref>
                <a>
                  <Logo />
                </a>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {themeButtonVisible && (
                <IconButton onClick={toggleTheme}>
                  {theme === 'dark' ? <ThemeIconLight /> : <ThemeIconDark />}
                </IconButton>
              )}
              <div className="relative">
                <WalletMultiButton className={`${IconButtonClasses} text-sm px-4 w-auto relative text-slate-500 dark:text-slate-400`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
