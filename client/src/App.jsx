import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOtp from "./pages/auth/ResetVerifyOtp";
import ResetPassword from "./pages/auth/ResetPassword";
import MyProfile from "./pages/my-profile/MyProfile";
import ProtectedRoute from "./extras/ProtectedRoute";
import UpdatePassword from "./pages/my-profile/UpdatePassword";
import UpdateProfile from "./pages/my-profile/UpdateProfile";
import Footer from "./components/Footer";
import AdminBrandPage from "./pages/admin/AdminBrandPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBikeModelPage from "./pages/admin/AdminBikePage";
import AdminPartPage from "./pages/admin/AdminPartPage";
import SingleProductPage from "./pages/products/SingleProduct";
import Cart from "./pages/Cart";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCart } from "./store/cart/cartSlice";
import ProductsPage from "./pages/products/ProductsPage";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/my-profile/OrderHistory";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import SupportAssistant from "./components/SupportAssistant";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  return (
    <div className="">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<SingleProductPage />} />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-password"
          element={
            <ProtectedRoute>
              <UpdatePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-profile"
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/brands"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminBrandPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bikes"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminBikeModelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parts"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminPartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payment-settings"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminPaymentSettings />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />

      {/* Site-wide rule-based support assistant (floating widget) */}
      <SupportAssistant />
    </div>
  );
}

export default App;
