import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  getPaymentSettings,
  adminUpdatePaymentSettings,
  clearPaymentSettingsError,
  clearPaymentSettingsSuccess,
} from "../../store/order/paymentSettingsSlice";
import Loader from "../../extras/Loader";

const AdminPaymentSettings = () => {
  const dispatch = useDispatch();
  const { settings, loading, error, success } = useSelector(
    (state) => state.paymentSettings
  );

  const [upiId, setUpiId] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");
  const [notifyAdmins, setNotifyAdmins] = useState(true);

  useEffect(() => {
    dispatch(getPaymentSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setUpiId(settings.upiId || "");
      setNotifyAdmins(settings.notifyAdminsOnNewOrder !== false);
    }
  }, [settings]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPaymentSettingsError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Settings saved");
      dispatch(clearPaymentSettingsSuccess());
      setQrFile(null);
      setQrPreview("");
    }
  }, [success, dispatch]);

  const handleQr = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    // The notification toggle makes every save meaningful, so we no longer
    // block when UPI/QR are empty — an admin may simply be flipping it.
    const fd = new FormData();
    fd.append("upiId", upiId);
    fd.append("notifyAdminsOnNewOrder", notifyAdmins);
    if (qrFile) fd.append("qrImage", qrFile);
    dispatch(adminUpdatePaymentSettings(fd));
  };

  if (loading && !settings) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8"
      >
        <h1 className="text-3xl font-bold text-blue-900 mb-8">
          Payment Settings
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPI ID
            </label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="e.g. samridhi@upi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI QR Code
            </label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                {qrPreview ? (
                  <img
                    src={qrPreview}
                    alt="New QR preview"
                    className="w-44 h-44 object-contain rounded-2xl border border-gray-200 bg-white p-2"
                  />
                ) : settings?.qrImage?.url ? (
                  <img
                    src={settings.qrImage.url}
                    alt="Current QR"
                    className="w-44 h-44 object-contain rounded-2xl border border-gray-200 bg-white p-2"
                  />
                ) : (
                  <div className="w-44 h-44 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-center text-sm text-gray-400 p-3">
                    No QR uploaded
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQr}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-blue-600"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Upload a clear image of your UPI QR code. Customers will see
                  this at checkout when paying online.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notifications
            </label>
            <div className="flex items-center justify-between gap-4 bg-blue-50/60 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Email admins on new orders
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  When on, all admins receive an email each time a customer
                  places an order (online orders are flagged for verification).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyAdmins}
                onClick={() => setNotifyAdmins((v) => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  notifyAdmins ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    notifyAdmins ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-60 transition-all duration-300"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPaymentSettings;
