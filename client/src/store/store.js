import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/user";
import otpSlice from "./auth-slice/otpSlice";
import brandSlice from "./product/brandSlice";
import bikeSlice from "./product/bikeSlice";
import partSlice from "./product/partsSlice";
import compareSlice from "./product/compareSlice";
import cartSlice from "./cart/cartSlice";
import orderSlice from "./order/orderSlice";
import paymentSettingsSlice from "./order/paymentSettingsSlice";
import couponSlice from "./order/couponSlice";
import supportSlice from "./order/supportSlice";
import addressSlice from "./order/addressSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    otp: otpSlice,
    brand: brandSlice,
    bike: bikeSlice,
    parts: partSlice,
    compare: compareSlice,
    cart: cartSlice,
    order: orderSlice,
    paymentSettings: paymentSettingsSlice,
    coupon: couponSlice,
    support: supportSlice,
    address: addressSlice,
  },
});

export default store;
