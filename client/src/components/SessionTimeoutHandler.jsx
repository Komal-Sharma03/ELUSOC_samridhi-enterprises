import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/auth-slice/user";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const SessionTimeoutHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const lastActiveTime = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Time configurations (in milliseconds)
  const INACTIVITY_TIMEOUT = 14 * 60 * 1000; // 14 minutes before warning
  const COUNTDOWN_TIME = 60 * 1000; // 1 minute warning countdown

  const resetTimer = () => {
    lastActiveTime.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setCountdown(60);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers and do nothing if user is guest
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setShowWarning(false);
      return;
    }

    // Event listeners to track activity
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Check inactivity every 10 seconds
    warningTimerRef.current = setInterval(() => {
      const inactiveDuration = Date.now() - lastActiveTime.current;
      if (inactiveDuration >= INACTIVITY_TIMEOUT && !showWarning) {
        setShowWarning(true);
      }
    }, 10000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isAuthenticated, showWarning]);

  // Handle countdown tick when warning is active
  useEffect(() => {
    if (showWarning) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 10000); // decrement by 10s or 1s. Let's make it run every 1s for accurate display:
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [showWarning]);

  // Separate effect for 1-second countdown updates for smoother UI
  useEffect(() => {
    let interval = null;
    if (showWarning) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showWarning]);

  const handleLogout = () => {
    setShowWarning(false);
    dispatch(logoutUser()).then(() => {
      toast.warning("You have been logged out due to inactivity.");
      navigate("/login");
    });
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 sm:p-8 text-center"
          >
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Are you still there?
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your session will expire in{" "}
              <span className="font-bold text-amber-600">{countdown}</span> seconds due
              to inactivity.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetTimer}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Stay Connected
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors duration-200"
              >
                Logout Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeoutHandler;
