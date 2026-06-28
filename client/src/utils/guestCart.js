import axiosInstance from "@/api";

const GUEST_CART_KEY = "guest_cart";
const EMPTY_CART = { items: [], total: 0 };

const getItemPartId = (item) => item.part?._id || item.part || item.partId;

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + Number(item.price || 0), 0);

export const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    const parsedCart = cart ? JSON.parse(cart) : EMPTY_CART;

    return {
      items: Array.isArray(parsedCart.items) ? parsedCart.items : [],
      total: Number(parsedCart.total || 0),
    };
  } catch (e) {
    return EMPTY_CART;
  }
};

export const saveGuestCart = (cart) => {
  const items = Array.isArray(cart.items) ? cart.items : [];
  localStorage.setItem(
    GUEST_CART_KEY,
    JSON.stringify({
      items,
      total: calculateTotal(items),
    })
  );
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

export const upsertGuestCartItem = async ({ partId, quantity }) => {
  const guestCart = getGuestCart();
  const existingItemIndex = guestCart.items.findIndex(
    (item) => getItemPartId(item) === partId
  );

  if (existingItemIndex >= 0) {
    const item = guestCart.items[existingItemIndex];
    item.quantity += quantity;
    item.price = item.part.price * item.quantity;
  } else {
    const partRes = await axiosInstance.get(`/api/parts/${partId}`);
    const partData = partRes.data.part;

    guestCart.items.push({
      part: partData,
      quantity,
      price: partData.price * quantity,
      name: partData.name,
    });
  }

  saveGuestCart(guestCart);
  return getGuestCart();
};

export const updateGuestCartItem = ({ partId, quantity }) => {
  const guestCart = getGuestCart();
  const itemIndex = guestCart.items.findIndex(
    (item) => getItemPartId(item) === partId
  );

  if (itemIndex >= 0) {
    const partData = guestCart.items[itemIndex].part;
    guestCart.items[itemIndex].quantity = quantity;
    guestCart.items[itemIndex].price = partData.price * quantity;
  }

  saveGuestCart(guestCart);
  return getGuestCart();
};

export const removeGuestCartItem = (partId) => {
  const guestCart = getGuestCart();
  guestCart.items = guestCart.items.filter((item) => getItemPartId(item) !== partId);
  saveGuestCart(guestCart);
  return getGuestCart();
};

export const resetGuestCart = () => {
  saveGuestCart(EMPTY_CART);
  return getGuestCart();
};

export const syncGuestCart = async (token) => {
  const guestCart = getGuestCart();

  if (!guestCart.items.length) {
    return { warnings: [] };
  }

  const response = await axiosInstance.post(
    "/api/cart/sync",
    {
      items: guestCart.items.map((item) => ({
        partId: getItemPartId(item),
        quantity: item.quantity,
      })),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const failedPartIds = new Set(
    (response.data.failedItems || []).map((item) => item.partId)
  );
  const unsyncedItems = guestCart.items.filter((item) =>
    failedPartIds.has(getItemPartId(item))
  );

  if (unsyncedItems.length) {
    saveGuestCart({ items: unsyncedItems });
  } else {
    clearGuestCart();
  }

  return {
    warnings: response.data.warnings || [],
    failedItems: response.data.failedItems || [],
  };
};
