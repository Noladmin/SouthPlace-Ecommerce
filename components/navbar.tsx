"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCart, getCartTotals } from "@/lib/cart-utils"
import AuthModal from "@/components/auth-modal"

const navLinks = [
  { name: "Home", href: "/" },
  { 
    name: "About", 
    href: "/about",
    dropdown: [
      { name: "Our Story", href: "/about" },
      { name: "Our History", href: "/about/history" },
      { name: "Meet Our Team", href: "/about/team" },
    ]
  },
  { name: "Menu", href: "/menu" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAboutDropdown, setShowAboutDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login")

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    const updateCartCount = () => {
      const cart = getCart()
      const { itemCount } = getCartTotals(cart)
      setCartCount(itemCount)
    }

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setIsAuthenticated(true)
          setUser(userData.user)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    // Update cart count on mount
    updateCartCount()
    checkAuthStatus()

    // Listen for cart updates
    const handleCartUpdate = () => {
      updateCartCount()
    }
    window.addEventListener('cartUpdated', handleCartUpdate)

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tastyBowlsCart') {
        updateCartCount()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    // Listen for auth changes (login/logout)
    const handleAuthChanged = () => {
      checkAuthStatus()
    }
    window.addEventListener('authChanged', handleAuthChanged)

    window.addEventListener("scroll", handleScroll)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChanged', handleAuthChanged)
    }
  }, [])

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" : "bg-white/80 backdrop-blur-sm py-4",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <picture>
              <source srcSet="/images/SouthLogo.png" />
              <img
                src="/images/SouthLogo.png"
                alt="South Place Logo"
                className="h-14 w-auto max-h-24 transition-all duration-300"
              />
            </picture>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setShowAboutDropdown(true)}
                    onMouseLeave={() => setShowAboutDropdown(false)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "font-medium transition-colors hover:text-primary flex items-center gap-1",
                        "text-gray-800",
                      )}
                    >
                      {link.name}
                      <ChevronDown className="h-4 w-4" />
                    </Link>
                    
                    <AnimatePresence>
                      {showAboutDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                        >
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "font-medium transition-colors hover:text-primary",
                      "text-gray-800",
                    )}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/cart"
              className={cn(
                "relative flex items-center justify-center p-2 rounded-lg transition-all hover:bg-gray-100",
                "text-gray-800",
              )}
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold border-2 border-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100",
                    "text-gray-800",
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.name || 'Account'}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    <Link
                      href="/account/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/order-history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Order History
                    </Link>
                    <Link
                      href="/track-order"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Track Order
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' })
                        setIsAuthenticated(false)
                        setUser(null)
                        setShowUserMenu(false)
                        try { window.dispatchEvent(new Event('authChanged')) } catch {}
                        window.location.href = '/'
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg px-6 border-2 border-gray-200 hover:border-gray-300"
                onClick={() => {
                  setAuthModalTab("login")
                  setShowAuthModal(true)
                }}
              >
                Sign In
              </Button>
            )}
            
            <Button
              asChild
              size="sm"
              className="rounded-lg px-6 bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20"
            >
              <Link href="/order">Order Now</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link
              href="/cart"
              className="relative flex items-center justify-center text-gray-800"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold border-2 border-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="text-2xl text-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <div>
                        <div className="text-gray-800 font-medium py-2 border-b border-gray-100 flex items-center justify-between">
                          <span>{link.name}</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                        <div className="ml-4 mt-2 space-y-2">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block text-gray-600 hover:text-primary font-medium transition-colors py-1 text-sm"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-800 hover:text-primary font-medium transition-colors py-2 border-b border-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account/dashboard"
                      className="text-gray-800 hover:text-primary font-medium transition-colors py-2 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/order-history"
                      className="text-gray-800 hover:text-primary font-medium transition-colors py-2 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Order History
                    </Link>
                    <Link
                      href="/track-order"
                      className="text-gray-800 hover:text-primary font-medium transition-colors py-2 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Track Order
                    </Link>
                    <button
                      onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' })
                        setIsAuthenticated(false)
                        setUser(null)
                        setIsMenuOpen(false)
                        try { window.dispatchEvent(new Event('authChanged')) } catch {}
                        window.location.href = '/'
                      }}
                      className="text-red-600 hover:text-red-700 font-medium transition-colors py-2 border-b border-gray-100 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalTab("login")
                      setShowAuthModal(true)
                      setIsMenuOpen(false)
                    }}
                    className="text-gray-800 hover:text-primary font-medium transition-colors py-2 border-b border-gray-100 text-left"
                  >
                    Sign In
                  </button>
                )}
                
                <Button asChild size="lg" className="mt-4 w-full">
                  <Link href="/order" onClick={() => setIsMenuOpen(false)}>
                    Order Now
                  </Link>
                </Button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* Auth Modal - Outside header to avoid z-index stacking context issues */}
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      defaultTab={authModalTab}
      redirectTo="/account/dashboard"
    />
    </>
  )
}
