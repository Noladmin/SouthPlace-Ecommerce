'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from '@/lib/motion';
import { 
  FaBars, FaTimes, FaChevronDown, FaChevronRight,
  FaHome, FaInfoCircle, FaConciergeBell, 
  FaEnvelope, FaBriefcase, FaUtensils, 
  FaBroom, FaTshirt, FaThLarge, FaAward, FaCalendarAlt,
  FaShoppingBag, FaUserCircle, FaSignInAlt, FaSignOutAlt
} from 'react-icons/fa';
import AuthModal from '@/components/auth-modal';
import { getCart, getCartTotals } from '@/lib/cart-utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isWhoWeAreOpen, setIsWhoWeAreOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsMobileServicesOpen(false); // Reset services menu when closing
  };
  const toggleMobileServices = () => setIsMobileServicesOpen(!isMobileServicesOpen);
  
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      const { itemCount } = getCartTotals(cart);
      setCartCount(itemCount);
    };

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUser(userData.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    updateCartCount();
    checkAuthStatus();

    const handleCartUpdate = () => updateCartCount();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tastyBowlsCart') {
        updateCartCount();
      }
    };
    const handleAuthChanged = () => checkAuthStatus();

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChanged', handleAuthChanged);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChanged', handleAuthChanged);
    };
  }, []);

  return (
    <>
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/SouthLogo.png"
                alt="South Place Catering Services"
                width={80}
                height={40}
                className="object-contain"
                priority
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-800 hover:text-orange-500 transition-colors font-medium">
                HOME
              </Link>
              {/* Who We Are Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsWhoWeAreOpen(true)}
                onMouseLeave={() => setIsWhoWeAreOpen(false)}
              >
                <Link
                  href="/who-we-are"
                  className="text-gray-800 hover:text-orange-500 transition-colors font-medium flex items-center"
                >
                  WHO WE ARE
                  <FaChevronDown className={`ml-1 transition-transform ${isWhoWeAreOpen ? 'rotate-180' : ''}`} />
                </Link>
                
                {isWhoWeAreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 backdrop-blur-sm"
                  >
                    <Link href="/who-we-are" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500 font-medium">
                      About Us
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <Link href="/who-we-are/awards" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500">
                      Awards & Reviews
                    </Link>
                  </motion.div>
                )}
              </div>
              
              {/* Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <Link
                  href="/services"
                  className="text-gray-800 hover:text-orange-500 transition-colors font-medium flex items-center"
                >
                  OUR SERVICES
                  <FaChevronDown className={`ml-1 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                </Link>
                
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 backdrop-blur-sm"
                  >
                    <Link href="/services" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500 font-medium">
                      All Services
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <Link href="/services/industrial-catering" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500">
                      Industrial Catering
                    </Link>
                    <Link href="/services/office-catering" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500">
                      Office Catering
                    </Link>
                    <Link href="/services/facilities-management" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500">
                      Facilities Management
                    </Link>
                    <Link href="/services/house-keeping" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500">
                      Housekeeping
                    </Link>
                    <Link href="/services/laundry-services" className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-orange-500">
                      Laundry Services
                    </Link>
                  </motion.div>
                )}
              </div>
              
              <Link href="/menu" className="text-gray-800 hover:text-orange-500 transition-colors font-medium">
                MENU
              </Link>
              <Link href="/contact" className="text-gray-800 hover:text-orange-500 transition-colors font-medium">
                CONTACT US
              </Link>
              <Link href="/careers" className="text-gray-800 hover:text-orange-500 transition-colors font-medium">
                CAREERS
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/cart" className="relative text-gray-800 hover:text-orange-500 transition-colors">
                <FaShoppingBag className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-orange-50 text-gray-800"
                  >
                    <FaUserCircle className="text-lg text-orange-500" />
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
                          await fetch('/api/auth/logout', { method: 'POST' });
                          setIsAuthenticated(false);
                          setUser(null);
                          setShowUserMenu(false);
                          try { window.dispatchEvent(new Event('authChanged')); } catch {}
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  <FaSignInAlt />
                  <span className="text-sm font-medium">Sign In</span>
                </button>
              )}

              <Link
                href="/order"
                className="bg-orange-500 hover:bg-orange-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-md"
              >
                Order Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-800 p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu - Full Screen Slide-in */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={closeMenu}
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                />
                
                {/* Slide-in Menu */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
                >
                  {/* Header with Close Button */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/images/SouthLogo.png"
                        alt="South Place"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                      <span className="font-bold text-gray-900">Menu</span>
                    </div>
                    <button
                      onClick={closeMenu}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Close menu"
                    >
                      <FaTimes size={24} className="text-gray-700" />
                    </button>
                  </div>

                  {/* Navigation Items */}
                  <nav className="p-6 space-y-2">
                    <Link 
                      href="/" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <FaHome className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">Home</span>
                    </Link>

                    <Link 
                      href="/who-we-are" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <FaInfoCircle className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">Who We Are</span>
                    </Link>

                    <Link 
                      href="/who-we-are/awards" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group ml-6"
                    >
                      <FaAward className="text-lg text-orange-400" />
                      <span className="text-sm text-gray-600 group-hover:text-orange-600">Awards & Reviews</span>
                    </Link>


                    {/* Services Accordion */}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <button
                        onClick={toggleMobileServices}
                        className="flex items-center justify-between w-full py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <FaConciergeBell className="text-xl text-orange-500" />
                          <span className="font-medium text-gray-700 group-hover:text-orange-600">Our Services</span>
                        </div>
                        <FaChevronRight 
                          className={`text-gray-400 transition-transform duration-300 ${isMobileServicesOpen ? 'rotate-90' : ''}`} 
                        />
                      </button>

                      {/* Services Submenu */}
                      <AnimatePresence>
                        {isMobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 mt-2 space-y-1 border-l-2 border-orange-200 ml-6">
                              <Link 
                                href="/services" 
                                onClick={closeMenu}
                                className="flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                              >
                                <FaThLarge className="text-base text-orange-400" />
                                <span className="text-sm text-gray-600 group-hover:text-orange-600">All Services</span>
                              </Link>

                              <Link 
                                href="/services/industrial-catering" 
                                onClick={closeMenu}
                                className="flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                              >
                                <FaUtensils className="text-base text-orange-400" />
                                <span className="text-sm text-gray-600 group-hover:text-orange-600">Industrial Catering</span>
                              </Link>

                              <Link 
                                href="/services/facilities-management" 
                                onClick={closeMenu}
                                className="flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                              >
                                <FaThLarge className="text-base text-orange-400" />
                                <span className="text-sm text-gray-600 group-hover:text-orange-600">Facilities Management</span>
                              </Link>

                              <Link 
                                href="/services/house-keeping" 
                                onClick={closeMenu}
                                className="flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                              >
                                <FaBroom className="text-base text-orange-400" />
                                <span className="text-sm text-gray-600 group-hover:text-orange-600">Housekeeping</span>
                              </Link>

                              <Link
                                href="/services/office-catering"
                                onClick={closeMenu}
                                className="flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                              >
                                <FaCalendarAlt className="text-base text-orange-400" />
                                <span className="text-sm text-gray-600 group-hover:text-orange-600">Office Catering</span>
                              </Link>
                              <Link
                                href="/services/laundry-services"
                                onClick={closeMenu}
                                className="flex items-center space-x-3 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                              >
                                <FaTshirt className="text-base text-orange-400" />
                                <span className="text-sm text-gray-600 group-hover:text-orange-600">Laundry Services</span>
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Link 
                      href="/contact" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <FaEnvelope className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">Contact Us</span>
                    </Link>

                    <Link 
                      href="/careers" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <FaBriefcase className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">Careers</span>
                    </Link>

                    <Link 
                      href="/menu" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <FaUtensils className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">Menu</span>
                    </Link>

                    <Link 
                      href="/cart" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <FaShoppingBag className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">Cart</span>
                    </Link>

                    <Link 
                      href="/order" 
                      onClick={closeMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <FaCalendarAlt className="text-xl text-orange-500" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600">Order Now</span>
                    </Link>
                  </nav>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-6 mt-4">
                    <p className="text-sm text-gray-500 text-center">
                      © 2025 South Place Catering Services
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>

    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      defaultTab={authModalTab}
      redirectTo="/account/dashboard"
    />
    </>
  );
}
