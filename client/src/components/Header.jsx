import {
  CircleUser,
  ShoppingCart,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Package,
  LogOut,
  UserCog,
  LifeBuoy,
  MapPin,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice/user";
import SearchBar from "./SearchBar";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";

function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // Returns active link classes for desktop nav items
  const navLinkClass = (path) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + "/");
    return `flex items-center gap-2 text-white text-sm font-semibold transition-colors duration-300 py-2 px-4 rounded-lg ${
      isActive
        ? "bg-white/25 underline underline-offset-4"
        : "hover:text-blue-100 hover:bg-white/10"
    }`;
  };

  // Mobile nav link class with larger touch target
  const mobileNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 text-white text-base font-semibold transition-colors duration-300 py-3 px-4 rounded-lg w-full ${
      isActive
        ? "bg-white/25 underline underline-offset-4"
        : "hover:text-blue-100 hover:bg-white/10"
    }`;
  };

  const headerVariants = {
    initial: {
      y: -100,
      opacity: 0,
      backdropFilter: "blur(0px)",
    },
    animate: {
      y: 0,
      opacity: 1,
      backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
    hover: {
      scale: 1.05,
      rotate: [0, -2, 2, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  const navItemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1 + 0.3,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
    hover: {
      y: -2,
      scale: 1.05,
      textShadow: "0 0 8px rgba(255,255,255,0.8)",
      transition: { duration: 0.3 },
    },
  };

  const mobileMenuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const dropdownVariants = {
    closed: { opacity: 0, scale: 0.95, y: -8 },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const cartVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.4 },
    },
    tap: { scale: 0.9 },
  };

  const cartItemCount = cart?.items?.length || 0;

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-r from-blue-400/95 via-blue-500/95 to-blue-400/95 shadow-xl shadow-blue-500/25"
          : "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 shadow-lg"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* ── Logo ── */}
          <motion.div
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="hidden sm:block"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <Link
              to="/"
              className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text hover:from-blue-100 hover:to-white transition-all duration-300"
            >
              Samridhi Enterprises
            </Link>
          </motion.div>

          {/* ── Desktop search ── */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <SearchBar variant="desktop" />
          </div>

          {/* ── Desktop right-side actions ── */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Products — all authenticated users */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/products" className={navLinkClass("/products")}>
                  Products
                </Link>
              </motion.div>
            )}

            {/* Dashboard — admin / manager only */}
            {isAuthenticated &&
              (user.role === "ADMIN" || user.role === "MANAGER") && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    to="/admin/dashboard"
                    className={navLinkClass("/admin/dashboard")}
                  >
                    Admin Dashboard
                  </Link>
                </motion.div>
              )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* ── Account dropdown ── */}
                <div className="relative" ref={accountRef}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsAccountOpen((v) => !v)}
                    aria-expanded={isAccountOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300"
                  >
                    <CircleUser className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">
                      {user?.name || "Account"}
                    </span>
                    <motion.span
                      animate={{ rotate: isAccountOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {isAccountOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 origin-top-right"
                        role="menu"
                        aria-label="Account menu"
                      >
                        <Link
                          to="/my-profile"
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <CircleUser className="w-4 h-4 flex-shrink-0" />
                          My Profile
                        </Link>
                        <Link
                          to="/my-orders"
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <Package className="w-4 h-4 flex-shrink-0" />
                          My Orders
                        </Link>
                        <Link
                          to="/support"
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <LifeBuoy className="w-4 h-4 flex-shrink-0" />
                          Help & Support
                        </Link>
                        <Link
                          to="/my-addresses"
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          My Addresses
                        </Link>
                        <Link
                          to="/update-profile"
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <UserCog className="w-4 h-4 flex-shrink-0" />
                          Edit Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={handleLogout}
                          role="menuitem"
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <motion.div
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="flex items-center gap-2"
              >
                <Link
                  to="/login"
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  <CircleUser className="w-4 h-4" />
                  Login
                </Link>
              </motion.div>
            )}

            {/* ── Cart icon ── */}
            <motion.div
              variants={cartVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="relative"
            >
              <Link
                to="/cart"
                aria-label={`Shopping cart — ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
                className="flex items-center"
              >
                <ShoppingCart className="text-white w-6 h-6" />
                <motion.span
                  key={cartItemCount}
                  initial={{ scale: 0.5, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-white to-blue-100 text-blue-500 text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-white/20 min-w-[20px] text-center"
                  aria-hidden="true"
                >
                  {cartItemCount}
                </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* ── Mobile hamburger ── */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            className="lg:hidden text-white p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? "close" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden bg-gradient-to-b from-blue-500/95 to-blue-400/95 backdrop-blur-lg border-t border-white/20"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <SearchBar variant="mobile" />
              </motion.div>

              <div className="space-y-2">
                {/* Products */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ x: 6 }}
                  >
                    <Link
                      to="/products"
                      className={mobileNavLinkClass("/products")}
                    >
                      Products
                    </Link>
                  </motion.div>
                )}

                {/* Dashboard */}
                {isAuthenticated &&
                  (user.role === "ADMIN" || user.role === "MANAGER") && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ x: 6 }}
                    >
                      <Link
                        to="/admin/dashboard"
                        className={mobileNavLinkClass("/admin/dashboard")}
                      >
                        Admin Dashboard
                      </Link>
                    </motion.div>
                  )}

                {isAuthenticated ? (
                  <>
                    {/* Profile */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      whileHover={{ x: 6 }}
                    >
                      <Link
                        to="/my-profile"
                        className={mobileNavLinkClass("/my-profile")}
                      >
                        <CircleUser className="w-5 h-5 flex-shrink-0" />
                        {user?.name || "My Profile"}
                      </Link>
                    </motion.div>

                    {/* My Orders */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ x: 6 }}
                    >
                      <Link
                        to="/my-orders"
                        className={mobileNavLinkClass("/my-orders")}
                      >
                        <Package className="w-5 h-5 flex-shrink-0" />
                        My Orders
                      </Link>
                    </motion.div>

                    {/* Help & Support */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.31 }}
                      whileHover={{ x: 6 }}
                    >
                      <Link
                        to="/support"
                        className={mobileNavLinkClass("/support")}
                      >
                        <LifeBuoy className="w-5 h-5 flex-shrink-0" />
                        Help & Support
                      </Link>
                    </motion.div>

                    {/* My Addresses */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.32 }}
                      whileHover={{ x: 6 }}
                    >
                      <Link
                        to="/my-addresses"
                        className={mobileNavLinkClass("/my-addresses")}
                      >
                        <MapPin className="w-5 h-5 flex-shrink-0" />
                        My Addresses
                      </Link>
                    </motion.div>

                    {/* Cart */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                      whileHover={{ x: 6 }}
                    >
                      <Link
                        to="/cart"
                        className={mobileNavLinkClass("/cart")}
                        aria-label={`Cart — ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
                      >
                        <div className="relative">
                          <ShoppingCart className="w-5 h-5" />
                          <span
                            className="absolute -top-2 -right-2 bg-gradient-to-r from-white to-blue-100 text-blue-500 text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg min-w-[18px] text-center"
                            aria-hidden="true"
                          >
                            {cartItemCount}
                          </span>
                        </div>
                        Cart
                      </Link>
                    </motion.div>

                    {/* Logout */}
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full bg-white/20 hover:bg-white/30 text-white text-base font-semibold py-3 px-4 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5 flex-shrink-0" />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ x: 6 }}
                  >
                    <Link
                      to="/login"
                      className="flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white text-base font-semibold py-3 px-4 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300 w-full"
                    >
                      <CircleUser className="w-5 h-5" />
                      Login
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
