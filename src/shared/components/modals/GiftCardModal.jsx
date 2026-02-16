import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClientAuth } from "../../contexts/ClientAuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { createGiftCardCheckoutSession } from "../../api/giftCards.api";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const PRESET_AMOUNTS = [25, 50, 100, 150, 200];

export default function GiftCardModal({ isOpen, onClose, onSuccess }) {
  const { client, isAuthenticated } = useClientAuth();
  const { tenant } = useTenant();
  const isGiftCardsEnabled = tenant?.features?.enableGiftCards !== false;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Success
  const [formData, setFormData] = useState({
    amount: 50,
    customAmount: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
  });
  const [giftCardCode, setGiftCardCode] = useState("");
  const [createdGiftCard, setCreatedGiftCard] = useState(null);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setStep(1);
    setFormData({
      amount: 50,
      customAmount: "",
      recipientName: "",
      recipientEmail: "",
      message: "",
    });
    setErrors({});
    setGiftCardCode("");
    setCreatedGiftCard(null);
    onClose();
  };

  const validateStep1 = () => {
    const newErrors = {};

    const amount = formData.customAmount || formData.amount;
    if (!amount || amount < 10) {
      newErrors.amount = "Minimum amount is £10";
    }
    if (amount > 500) {
      newErrors.amount = "Maximum amount is £500";
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Recipient name is required";
    }

    if (!formData.recipientEmail.trim()) {
      newErrors.recipientEmail = "Recipient email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = "Invalid email address";
    }

    if (formData.message.length > 500) {
      newErrors.message = "Message must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!isGiftCardsEnabled) {
      toast.error("Gift cards are currently unavailable for this business");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to purchase a gift card");
      return;
    }

    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePurchase = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const amount = parseFloat(formData.customAmount || formData.amount);

      const response = await createGiftCardCheckoutSession({
        tenantId: tenant._id,
        amount,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        message: formData.message || undefined,
      });

      if (!response?.url) {
        throw new Error("Checkout URL not returned");
      }

      toast.success("Redirecting to secure checkout...");

      if (onSuccess) {
        onSuccess(response);
      }

      window.location.href = response.url;
    } catch (error) {
      console.error("Gift card purchase error:", error);
      toast.error(
        error.response?.data?.error || "Failed to start gift card checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  const getAmount = () => {
    return parseFloat(formData.customAmount || formData.amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 3 ? "Gift Card Sent" : "Send Gift Card"}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {!isGiftCardsEnabled ? (
                <div className="text-center space-y-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Gift cards are unavailable
                    </h3>
                    <p className="text-gray-600">
                      This business has not enabled gift card sales yet.
                    </p>
                  </div>
                  <Button onClick={handleClose} className="w-full">
                    Close
                  </Button>
                </div>
              ) : (
                <>
              {/* Step 1: Gift Card Details */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Amount Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {PRESET_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              amount,
                              customAmount: "",
                            });
                            setErrors({ ...errors, amount: undefined });
                          }}
                          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                            formData.amount === amount && !formData.customAmount
                              ? "bg-brand-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          £{amount}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        Custom Amount (£10-£500)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        placeholder="Enter custom amount"
                        value={formData.customAmount}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            customAmount: e.target.value,
                          });
                          setErrors({ ...errors, amount: undefined });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Recipient Details */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          recipientName: e.target.value,
                        });
                        setErrors({ ...errors, recipientName: undefined });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                        errors.recipientName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Who is this gift for?"
                    />
                    {errors.recipientName && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.recipientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      value={formData.recipientEmail}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          recipientEmail: e.target.value,
                        });
                        setErrors({ ...errors, recipientEmail: undefined });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                        errors.recipientEmail
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="recipient@example.com"
                    />
                    {errors.recipientEmail && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.recipientEmail}
                      </p>
                    )}
                  </div>

                  {/* Personal Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                      placeholder="Add a personal message to the recipient..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.message.length}/500 characters
                    </p>
                  </div>

                  <Button onClick={handleNextStep} className="w-full" size="lg">
                    Review Gift Card
                  </Button>
                </div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Review & Confirm
                    </h3>
                    <p className="text-sm text-gray-600">
                      You&apos;ll be redirected to secure Stripe checkout to
                      complete payment.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gift Card Amount</span>
                        <span className="font-semibold">
                          £{getAmount().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recipient</span>
                        <span className="font-semibold">
                          {formData.recipientName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recipient Email</span>
                        <span className="font-semibold text-sm">
                          {formData.recipientEmail}
                        </span>
                      </div>
                      {formData.message && (
                        <div className="rounded-lg bg-white border border-gray-200 p-3 text-sm text-gray-700">
                          <span className="font-medium">Message:</span> {formData.message}
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-lg">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-brand-600">
                          £{getAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePurchase}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Sending..." : "Send Gift Card"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Gift Card Sent
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your gift card has been created and sent to{" "}
                      {formData.recipientEmail}
                    </p>

                    <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-6 mb-6">
                      <p className="text-sm text-gray-600 mb-2">
                        Gift Card Code
                      </p>
                      <p className="text-2xl font-mono font-bold text-brand-600 tracking-wider">
                        {giftCardCode}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 text-left space-y-2">
                      <p>✅ Gift card sent to recipient's email</p>
                      {createdGiftCard?.expiryDate && (
                        <p>
                          ✅ Expires on{" "}
                          {new Date(createdGiftCard.expiryDate).toLocaleDateString("en-GB")}
                        </p>
                      )}
                      <p>✅ Valid for 1 year from purchase date</p>
                      <p>✅ Can be used for any service</p>
                    </div>
                  </div>

                  <Button onClick={handleClose} className="w-full">
                    Done
                  </Button>
                </div>
              )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
