import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/orders";

const authConfig = (multipart = false) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...(multipart ? { "Content-Type": "multipart/form-data" } : {}),
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create an order from the user's cart (multipart: optional paymentScreenshot)
export const createOrder = createAsyncThunk(
  "order/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/new`,
        formData,
        authConfig(true)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getMyOrders = createAsyncThunk(
  "order/getMine",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/my-orders`,
        authConfig()
      );
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOrderById = createAsyncThunk(
  "order/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/${id}`,
        authConfig()
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin
export const adminGetAllOrders = createAsyncThunk(
  "order/adminGetAll",
  async (status, { rejectWithValue }) => {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const response = await axiosInstance.get(
        `${API_URL}/admin/all${query}`,
        authConfig()
      );
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin
export const adminVerifyPayment = createAsyncThunk(
  "order/adminVerify",
  async ({ id, action, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/admin/verify/${id}`,
        { action, rejectionReason },
        authConfig()
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin — dashboard analytics (real data)
export const adminGetDashboardAnalytics = createAsyncThunk(
  "order/adminAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/admin/analytics`,
        authConfig()
      );
      return response.data.analytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin — inventory overview
export const adminGetInventory = createAsyncThunk(
  "order/adminInventory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/admin/inventory`,
        authConfig()
      );
      return response.data.inventory;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin — chart-oriented sales analytics (monthly trends, top products,
// customer growth, recent orders) for the dedicated Sales Analytics page.
export const adminGetSalesAnalytics = createAsyncThunk(
  "order/adminSalesAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/admin/sales-analytics`,
        authConfig()
      );
      return response.data.salesAnalytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin — update order fulfilment status
export const adminUpdateOrderStatus = createAsyncThunk(
  "order/adminUpdateStatus",
  async ({ id, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/admin/status/${id}`,
        { orderStatus },
        authConfig()
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    adminOrders: [],
    currentOrder: null,
    lastCreatedOrder: null,
    analytics: null,
    salesAnalytics: null,
    inventory: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderSuccess: (state) => {
      state.success = false;
      state.lastCreatedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastCreatedOrder = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // My orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Single order
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: all orders
      .addCase(adminGetAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.adminOrders = action.payload;
      })
      .addCase(adminGetAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: verify
      .addCase(adminVerifyPayment.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(adminVerifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload;
        state.adminOrders = state.adminOrders.map((o) =>
          o._id === updated._id ? { ...o, ...updated } : o
        );
      })
      .addCase(adminVerifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: dashboard analytics
      .addCase(adminGetDashboardAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(adminGetDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: inventory overview
      .addCase(adminGetInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(adminGetInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: sales analytics (charts)
      .addCase(adminGetSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.salesAnalytics = action.payload;
      })
      .addCase(adminGetSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: update order status
      .addCase(adminUpdateOrderStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload;
        state.adminOrders = state.adminOrders.map((o) =>
          o._id === updated._id ? { ...o, ...updated } : o
        );
      })
      .addCase(adminUpdateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearOrderSuccess } = orderSlice.actions;
export default orderSlice.reducer;
