import {
  Car,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, useTransform, useMotionValue, useReducedMotion } from "framer-motion";

const quickLinks = [
  { name: "Home", to: "/", icon: "🏠" },
  { name: "Products", to: "/products", icon: "🛍️" },
  { name: "Order Now", href: "#order", icon: "🚀" },
  { name: "Reviews", href: "#reviews", icon: "⭐" },
];

const supportLinks = [
  { name: "FAQ", href: "#faq", icon: "❓" },
  { name: "Contact", href: "#contact", icon: "📞" },
  { name: "Support", href: "#support", icon: "🛠️" },
  { name: "Warranty", href: "#warranty", icon: "🔒" },
];

const linkClasses =
  "group flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const yTransform = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Track the cursor with motion values instead of React state so the
  // decorative blob can follow the pointer without re-rendering the whole
  // footer on every mouse move.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const blobX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const blobY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  // Compute the decorative particle positions once instead of recalculating
  // random values on every render.
  const particles = useMemo(
    () =>
      [...Array(6)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - 192);
    mouseY.set(e.clientY - rect.top - 192);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderQuickLink = (link, index) => {
    const inner = (
      <>
        <span className="text-lg mr-3" aria-hidden="true">
          {link.icon}
        </span>
        <span className="relative font-medium">
          {link.name}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
        </span>
      </>
    );

    return (
      <motion.li
        key={link.name}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 * index }}
        whileHover={{ x: 8, scale: 1.05 }}
      >
        {link.to ? (
          <Link to={link.to} className={linkClasses}>
            {inner}
          </Link>
        ) : (
          <a href={link.href} className={linkClasses}>
            {inner}
          </a>
        )}
      </motion.li>
    );
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-white text-gray-800 overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ y: prefersReducedMotion ? 0 : yTransform }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.08),transparent_60%)]"
      ></div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.06),transparent_50%)]"
      ></div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.04),transparent_50%)]"
      ></div>

      <motion.div
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        style={{ scaleX }}
      ></motion.div>

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        ></motion.div>
      )}

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute w-96 h-96 rounded-full bg-blue-500/3 blur-3xl pointer-events-none"
          style={{ x: blobX, y: blobY }}
        ></motion.div>
      )}

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-blue-500 bg-clip-text text-transparent mb-4">
              Stay Connected
            </h2>
            <div
              aria-hidden="true"
              className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-400 mx-auto rounded-full"
            ></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="group">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/40">
                    <Car className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-bold text-2xl bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent">
                      Samridhi Enterprises
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-base">
                  Delivering excellence in automotive solutions with
                  cutting-edge technology and unparalleled service quality.
                </p>
                <div className="flex space-x-2 pt-6" aria-hidden="true">
                  {[Star, Zap, Shield].map((Icon, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200"
                    >
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.nav
              aria-label="Quick links"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              onMouseEnter={() => setHoveredSection("links")}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative"
            >
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-8 relative">
                  <span className="bg-gradient-to-r from-blue-600 to-gray-700 bg-clip-text text-transparent">
                    Quick Links
                  </span>
                  <motion.div
                    aria-hidden="true"
                    animate={{
                      width: hoveredSection === "links" ? "100%" : "3rem",
                    }}
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    transition={{ duration: 0.4 }}
                  ></motion.div>
                </h3>
                <ul className="space-y-4">
                  {quickLinks.map((link, index) => renderQuickLink(link, index))}
                </ul>
              </div>
            </motion.nav>

            <motion.nav
              aria-label="Support"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              onMouseEnter={() => setHoveredSection("support")}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative"
            >
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-8 relative">
                  <span className="bg-gradient-to-r from-blue-600 to-gray-700 bg-clip-text text-transparent">
                    Support
                  </span>
                  <motion.div
                    aria-hidden="true"
                    animate={{
                      width: hoveredSection === "support" ? "100%" : "3rem",
                    }}
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    transition={{ duration: 0.4 }}
                  ></motion.div>
                </h3>
                <ul className="space-y-4">
                  {supportLinks.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      whileHover={{ x: 8, scale: 1.05 }}
                    >
                      <a href={link.href} className={linkClasses}>
                        <span className="text-lg mr-3" aria-hidden="true">
                          {link.icon}
                        </span>
                        <span className="relative font-medium">
                          {link.name}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.nav>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              onMouseEnter={() => setHoveredSection("contact")}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative"
            >
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-8 relative">
                  <span className="bg-gradient-to-r from-blue-600 to-gray-700 bg-clip-text text-transparent">
                    Contact Us
                  </span>
                  <motion.div
                    aria-hidden="true"
                    animate={{
                      width: hoveredSection === "contact" ? "100%" : "3rem",
                    }}
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    transition={{ duration: 0.4 }}
                  ></motion.div>
                </h3>
                <ul className="space-y-6">
                  <li>
                    <a
                      href="tel:+919999999999"
                      className="group flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 shadow-lg border border-blue-200">
                        <Phone
                          className="w-5 h-5 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold">
                          Phone
                        </span>
                        <span className="text-sm opacity-75">
                          +91 99999 99999
                        </span>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:email@gmail.com"
                      className="group flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mr-4 shadow-lg border border-blue-500/20">
                        <Mail
                          className="w-5 h-5 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold">
                          Email
                        </span>
                        <span className="text-sm opacity-75">
                          email@gmail.com
                        </span>
                      </div>
                    </a>
                  </li>
                  <li>
                    <div className="group flex items-center text-gray-600">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mr-4 shadow-lg border border-blue-500/20">
                        <MapPin
                          className="w-5 h-5 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold">
                          Location
                        </span>
                        <span className="text-sm opacity-75">India</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 pt-8 border-t border-gray-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
              <p className="text-gray-500 text-sm text-center sm:text-left">
                © {new Date().getFullYear()} Samridhi Enterprises. All rights
                reserved.
              </p>
              <motion.button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-400/50 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <ArrowUp className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-blue-400 to-gray-200"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(229,231,235,1) 0%, rgba(59,130,246,0.8) 50%, rgba(229,231,235,1) 100%)",
              "linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(229,231,235,1) 50%, rgba(59,130,246,0.8) 100%)",
              "linear-gradient(90deg, rgba(229,231,235,1) 0%, rgba(59,130,246,0.8) 50%, rgba(229,231,235,1) 100%)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        ></motion.div>
      )}

      {!prefersReducedMotion &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            className="absolute w-2 h-2 bg-blue-400/60 rounded-full blur-sm"
            style={{ left: p.left, top: p.top }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
    </motion.footer>
  );
};

export default Footer;
