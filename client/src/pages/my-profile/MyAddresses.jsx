// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check,
  X,
} from "lucide-react";
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  clearAddressError,
  clearAddressSuccess,
} from "@/store/order/addressSlice";
import Loader from "../../extras/Loader";

const EMPTY_FORM = {
  label: "",
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const MyAddresses = () => {
  const dispatch = useDispatch();
  const { addresses, loading, actionLoading, error, success } = useSelector(
    (s) => s.address
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(getMyAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setConfirmDelete(null);
      dispatch(clearAddressSuccess());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAddressError());
    }
  }, [error, dispatch]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingId(a._id);
    setForm({
      label: a.label || "",
      fullName: a.fullName || "",
      phone: a.phone || "",
      addressLine: a.addressLine || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
      isDefault: a.isDefault || false,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = () => {
    setFormError("");
    const required = ["fullName", "phone", "addressLine", "city", "pincode"];
    const missing = required.filter((f) => !String(form[f]).trim());
    if (missing.length > 0) {
      return setFormError("Please fill all required fields");
    }
    if (editingId) {
      dispatch(updateAddress({ id: editingId, payload: form }));
    } else {
      dispatch(addAddress(form));
    }
  };

  if (loading && addresses.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-2xl">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
              <p className="text-gray-600">
                Manage your saved delivery addresses
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </motion.div>

        {addresses.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 p-12 text-center text-gray-500">
            <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            You have no saved addresses yet.
            <div className="mt-4">
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
              >
                <Plus className="w-4 h-4" /> Add your first address
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a._id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow border p-5 ${
                  a.isDefault ? "border-blue-400 ring-1 ring-blue-200" : "border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {a.label && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {a.label}
                      </span>
                    )}
                    {a.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Star className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(a)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{a.fullName}</p>
                <p className="text-sm text-gray-600 mt-0.5">{a.phone}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {a.addressLine}, {a.city}
                  {a.state ? `, ${a.state}` : ""} — {a.pincode}
                </p>
                {!a.isDefault && (
                  <button
                    onClick={() => dispatch(setDefaultAddress(a._id))}
                    disabled={actionLoading}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" /> Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Address" : "Add Address"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (optional)
                </label>
                <input
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  maxLength={40}
                  placeholder="e.g. Home, Office"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleChange}
                  placeholder="House no, street, area"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  name="isDefault"
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                Set as default address
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
              >
                {editingId ? "Save Changes" : "Add Address"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete address?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete the address for{" "}
              <span className="font-semibold">{confirmDelete.fullName}</span>. This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => dispatch(deleteAddress(confirmDelete._id))}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddresses;
