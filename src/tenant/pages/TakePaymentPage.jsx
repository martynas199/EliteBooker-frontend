import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { api } from "../../shared/lib/apiClient";
import { loadStripe } from "@stripe/stripe-js";

/**
 * TAP TO PAY - TAKE PAYMENT PAGE
 *
 * Enterprise-grade mobile-first payment processing interface
 *
 * Flow:
 * 1. Select Appointment (or custom payment)
 * 2. Enter/Confirm Amount (with tip options)
 * 3. Tap to Pay (NFC card reader)
 * 4. Result (success/failure with receipt options)
 *
 * Security:
 * - Role-based access (Owner/Manager/Specialist)
 * - Specialists can only process their own appointments
 * - All sensitive card data stays in Stripe SDK
 *
 * Performance:
 * - 60fps animations
 * - Optimistic UI updates
 * - Haptic feedback on mobile
 */

export default function TakePaymentPage() {
  const navigate = useNavigate();
  const stripeRef = useRef(null); // Store Stripe.js instance for mobile payments
  const cancelPaymentRef = useRef(false); // Track if user canceled payment

  // State management
  const [step, setStep] = useState(1); // 1: Select, 2: Amount, 3: Tap, 4: Result
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCustomPayment, setIsCustomPayment] = useState(false);
  const [amount, setAmount] = useState(0);
  const [tip, setTip] = useState(0);
  const [tipPercent, setTipPercent] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceSupported, setDeviceSupported] = useState(true);
  const [deviceWarning, setDeviceWarning] = useState(null);
  const [sdkStatus, setSdkStatus] = useState("initializing"); // initializing, ready, error

  // Initialize Stripe SDK on mount
  useEffect(() => {
    initializePaymentSdk();
  }, []);

  // Check device capabilities on mount
  useEffect(() => {
    checkDeviceCapabilities();
  }, []);

  // Load today's appointments on mount
  useEffect(() => {
    loadTodaysAppointments();
  }, []);

  // ==================== STRIPE SDK INITIALIZATION ====================

  const initializePaymentSdk = async () => {
    try {
      setSdkStatus("initializing");

      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log(
        "🔍 Device detection - isMobile:",
        isMobile,
        "userAgent:",
        navigator.userAgent
      );

      // Initialize Stripe.js for all devices (works everywhere)
      console.log("📱 Initializing Stripe.js for payments");

      try {
        const configResponse = await api.get("/payments/config");
        console.log("📡 Config response:", configResponse.data);

        if (
          !configResponse.data.success ||
          !configResponse.data.publishableKey
        ) {
          console.error("❌ No publishable key in response");
          throw new Error("Failed to get Stripe publishable key");
        }

        console.log(
          "🔑 Loading Stripe with key:",
          configResponse.data.publishableKey.substring(0, 20) + "..."
        );
        const stripe = await loadStripe(configResponse.data.publishableKey);

        if (!stripe) {
          console.error("❌ Stripe.js failed to load");
          throw new Error("Failed to initialize Stripe.js");
        }

        stripeRef.current = stripe;
        console.log(
          "✅ Stripe.js initialized, stripeRef set:",
          !!stripeRef.current
        );
      } catch (configError) {
        console.error("❌ Config error:", configError);
        throw configError;
      }

      setSdkStatus("ready");
    } catch (err) {
      console.error("❌ Stripe initialization error:", err);
      setSdkStatus("error");
      setDeviceWarning(`Setup failed: ${err.message}`);
      setSdkStatus("ready"); // Allow fallback
      stripeRef.current = null;
    }
  };

  // ==================== DEVICE CAPABILITY CHECK ====================

  const checkDeviceCapabilities = () => {
    const warnings = [];

    // Check if HTTPS (required for payment APIs)
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      warnings.push("HTTPS required for secure payments");
      setDeviceSupported(false);
    }

    // Check if mobile device (optimal for Tap to Pay)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      warnings.push("Tap to Pay works best on mobile devices");
    }

    // Check for NFC API support (experimental)
    if ("NDEFReader" in window) {
      console.log("✅ Web NFC API available");
    } else {
      console.log("ℹ️ Web NFC API not available (using Stripe.js wallets)");
    }

    // Check for payment request API
    if (!window.PaymentRequest) {
      warnings.push("Payment API not supported on this browser");
    }

    // In development mode, allow testing on any device
    if (window.location.hostname === "localhost") {
      console.log("🧪 Development mode: All device checks bypassed");
      setDeviceSupported(true);
      setDeviceWarning(null);
      return;
    }

    if (warnings.length > 0) {
      setDeviceWarning(warnings.join(". "));
    }
  };

  // ==================== DATA LOADING ====================

  const loadTodaysAppointments = async () => {
    try {
      const response = await api.get("/payments/appointments/today");
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError("Failed to load appointments");
    }
  };

  // ==================== STEP NAVIGATION ====================

  const goToStep = (newStep) => {
    setStep(newStep);
    setError(null);
  };

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsCustomPayment(false);
    setAmount(appointment.remainingBalance || appointment.totalPrice);
    setTip(0);
    setTipPercent(0);
    goToStep(2);
  };

  const handleCustomPayment = () => {
    setSelectedAppointment(null);
    setIsCustomPayment(true);
    setAmount(0);
    setTip(0);
    setTipPercent(0);
    goToStep(2);
  };

  // ==================== AMOUNT CALCULATION ====================

  const handleAmountChange = (newAmount) => {
    setAmount(Math.max(0, parseInt(newAmount) || 0));
    // Recalculate percentage-based tip
    if (tipPercent > 0) {
      setTip(Math.round((newAmount * tipPercent) / 100));
    }
  };

  const handleTipPercentChange = (percent) => {
    setTipPercent(percent);
    setCustomTip("");
    if (percent === 0) {
      setTip(0);
    } else {
      setTip(Math.round((amount * percent) / 100));
    }
  };

  const handleCustomTipChange = (value) => {
    setCustomTip(value);
    setTipPercent(0);
    setTip(Math.max(0, parseInt(value) || 0));
  };

  const totalAmount = amount + tip;

  // ==================== CANCEL PAYMENT ====================

  const handleCancelPayment = () => {
    console.log("🚫 Payment canceled by user");
    cancelPaymentRef.current = true;
    setIsProcessing(false);
    goToStep(2); // Go back to amount screen
  };

  // ==================== PAYMENT PROCESSING ====================

  const handleTakePayment = async () => {
    if (totalAmount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (sdkStatus !== "ready") {
      setError("Payments not ready. Please wait or refresh the page.");
      return;
    }

    if (!stripeRef.current) {
      setError("Stripe.js not ready. Please refresh the page and try again.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    cancelPaymentRef.current = false; // Reset cancel flag
    goToStep(3); // Move to Tap to Pay screen

    try {
      // Step 1: Create Payment Intent
      const intentResponse = await api.post("/payments/intents", {
        appointmentId: selectedAppointment?._id || null,
        clientId: selectedAppointment?.client?._id,
        amount: amount, // Already in pence from state
        tip: tip, // Already in pence from state
        currency: "gbp",
        flowType: "wallet",
        metadata: {
          deviceType: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
            ? "mobile"
            : "web",
        },
      });

      if (!intentResponse.data.success) {
        throw new Error(
          intentResponse.data.message || "Failed to create payment intent"
        );
      }

      const { clientSecret, paymentIntentId, paymentId } =
        intentResponse.data.data;

      console.log("💳 Payment Intent created:", paymentIntentId);

      // Step 2 & 3: Collect and process payment
      console.log("🔍 Debug - stripeRef:", !!stripeRef.current);

      if (!stripeRef.current) {
        throw new Error(
          "Stripe.js failed to initialize. Please refresh and try again."
        );
      }

      // Use Stripe.js with Payment Request Button (Apple Pay / Google Pay)
      console.log("📱 Checking for Apple Pay / Google Pay...");

      const paymentRequest = stripeRef.current.paymentRequest({
        country: "GB",
        currency: "gbp",
        total: {
          label: selectedAppointment ? `Appointment Payment` : "Custom Payment",
          amount: totalAmount,
        },
        requestPayerName: true,
        requestPayerEmail: false,
      });

      // Check if Apple Pay or Google Pay is available
      const canMakePayment = await paymentRequest.canMakePayment();
      const walletAvailable =
        !!canMakePayment?.applePay || !!canMakePayment?.googlePay;

      if (!walletAvailable) {
        throw new Error(
          "Apple Pay / Google Pay not available on this device. Enable it in your wallet settings or switch to a supported browser."
        );
      }

      console.log("✅ Mobile wallet available:", canMakePayment);

      // Set up payment method handler
      let paymentMethodReceived = false;
      let walletPaymentIntent = null;
      let walletError = null;

      paymentRequest.on("paymentmethod", async (ev) => {
        try {
          // Confirm the payment with the PaymentMethod from wallet
          const { error: confirmError, paymentIntent } =
            await stripeRef.current.confirmCardPayment(
              clientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false, redirect: "if_required" }
            );

          if (confirmError) {
            ev.complete("fail");
            walletError = confirmError;
            return;
          }

          let finalIntent = paymentIntent;

          if (paymentIntent?.status === "requires_action") {
            console.log(
              "⚠️ Additional authentication required, invoking handleCardAction"
            );
            const { error: actionError, paymentIntent: actionIntent } =
              await stripeRef.current.handleCardAction(clientSecret);

            if (actionError) {
              ev.complete("fail");
              walletError = actionError;
              return;
            }

            finalIntent = actionIntent;
          }

          ev.complete("success");
          paymentMethodReceived = true;
          walletPaymentIntent = finalIntent;
          console.log("✅ Payment processed via mobile wallet");
        } catch (err) {
          ev.complete("fail");
          walletError = err;
        }
      });

      // Show the payment sheet
      await paymentRequest.show();

      if (walletError) {
        throw walletError;
      }

      // Wait for payment method event to complete
      if (!paymentMethodReceived || !walletPaymentIntent) {
        throw new Error("Payment was canceled or failed");
      }

      // Step 4: Confirm payment and capture (for manual capture)
      const confirmResponse = await api.post("/payments/confirm", {
        paymentIntentId,
      });

      if (!confirmResponse.data.success) {
        throw new Error("Payment processed but confirmation failed");
      }

      const payment = confirmResponse.data.data;

      // Payment successful
      setPaymentResult({
        success: true,
        paymentId,
        amount: totalAmount,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        receiptNumber: payment.receiptNumber,
        client: payment.client,
      });
      goToStep(4);

      // Haptic feedback on success (mobile only)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setPaymentResult({
        success: false,
        error: err.message,
      });
      goToStep(4);

      // Haptic feedback on error (mobile only)
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Poll payment status until succeeded or timeout
   * In production, Stripe webhooks update status automatically
   */
  const pollPaymentStatus = async (paymentIntentId, timeout = 30000) => {
    const startTime = Date.now();
    const pollInterval = 1000; // Poll every second

    while (Date.now() - startTime < timeout) {
      // Check if user canceled
      if (cancelPaymentRef.current) {
        throw new Error("Payment canceled");
      }

      try {
        const response = await api.get(`/payments/status/${paymentIntentId}`);
        if (response.data.success) {
          const payment = response.data.data;

          if (payment.status === "succeeded") {
            return {
              status: "succeeded",
              cardBrand: payment.cardBrand,
              cardLast4: payment.cardLast4,
              receiptNumber: payment.receiptNumber,
              client: payment.client,
            };
          } else if (payment.status === "failed") {
            return {
              status: "failed",
              error: payment.error,
            };
          }
        }
      } catch (err) {
        console.error("Error polling payment status:", err);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error("Payment timeout - please check payment status manually");
  };

  // ==================== RESULT ACTIONS ====================

  const handleSendReceipt = async (method) => {
    // TODO: Implement receipt sending
    console.log(`Sending receipt via ${method}`);
  };

  const handleTakeAnotherPayment = () => {
    // Reset state
    setSelectedAppointment(null);
    setIsCustomPayment(false);
    setAmount(0);
    setTip(0);
    setTipPercent(0);
    setCustomTip("");
    setPaymentResult(null);
    setError(null);
    goToStep(1);
  };

  // ==================== FILTERING ====================

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName =
      `${apt.client.firstName} ${apt.client.lastName}`.toLowerCase();
    const services = apt.services
      .map((s) => s.service.name)
      .join(" ")
      .toLowerCase();
    return clientName.includes(query) || services.includes(query);
  });

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Device Warning Banner */}
      {deviceWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">
                  Device Compatibility Notice
                </p>
                <p className="text-sm text-yellow-700 mt-1">{deviceWarning}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!deviceSupported && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  Device Not Supported
                </p>
                <p className="text-sm text-red-700 mt-1">
                  This device cannot process secure payments. Please use a
                  mobile device with HTTPS connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === 1) {
                  navigate(-1);
                } else {
                  goToStep(step - 1);
                }
              }}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Take Payment</h1>
              <p className="text-sm text-gray-500">
                {step === 1 && "Select appointment or custom payment"}
                {step === 2 && "Enter amount and tip"}
                {step === 3 && "Tap card or phone"}
                {step === 4 &&
                  (paymentResult?.success
                    ? "Payment successful"
                    : "Payment failed")}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all ${
                  s <= step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* STEP 1: SELECT APPOINTMENT */}
        {step === 1 && <SelectAppointmentScreen />}

        {/* STEP 2: AMOUNT */}
        {step === 2 && <AmountScreen />}

        {/* STEP 3: TAP TO PAY */}
        {step === 3 && <TapToPayScreen />}

        {/* STEP 4: RESULT */}
        {step === 4 && <ResultScreen />}
      </div>
    </div>
  );

  // ==================== SCREEN COMPONENTS ====================

  function SelectAppointmentScreen() {
    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by client name or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Custom payment option */}
        <button
          onClick={handleCustomPayment}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Custom Payment</p>
              <p className="text-sm text-gray-500">No appointment linked</p>
            </div>
          </div>
        </button>

        {/* Today's appointments */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Today's Appointments</h3>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <button
                key={apt._id}
                onClick={() => handleSelectAppointment(apt)}
                className="w-full p-4 bg-white border rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {apt.client.firstName} {apt.client.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {apt.services.map((s) => s.service.name).join(", ")}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(apt.date), "h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      £{(apt.totalPrice / 100).toFixed(2)}
                    </p>
                    {apt.remainingBalance > 0 && (
                      <p className="text-sm text-orange-600 mt-1">
                        £{(apt.remainingBalance / 100).toFixed(2)} due
                      </p>
                    )}
                    {apt.isPaid && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  function AmountScreen() {
    return (
      <div className="space-y-6">
        {/* Appointment/Payment info */}
        <div className="bg-white border rounded-lg p-4">
          {selectedAppointment ? (
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-medium text-lg">
                {selectedAppointment.client.firstName}{" "}
                {selectedAppointment.client.lastName}
              </p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">Services</p>
                {selectedAppointment.services.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span>{s.service.name}</span>
                    <span className="font-medium">
                      £{(s.service.price / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="font-medium text-lg">Custom Payment</p>
              <p className="text-sm text-gray-500 mt-1">
                No appointment linked
              </p>
            </div>
          )}
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
              £
            </span>
            <input
              type="number"
              value={amount / 100}
              onChange={(e) =>
                handleAmountChange(parseFloat(e.target.value) * 100)
              }
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Quick amount buttons */}
          {selectedAppointment && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                onClick={() =>
                  handleAmountChange(selectedAppointment.totalPrice)
                }
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Full (£{(selectedAppointment.totalPrice / 100).toFixed(2)})
              </button>
              {selectedAppointment.remainingBalance > 0 && (
                <button
                  onClick={() =>
                    handleAmountChange(selectedAppointment.remainingBalance)
                  }
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Balance (£
                  {(selectedAppointment.remainingBalance / 100).toFixed(2)})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tip selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Tip (Optional)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 5, 10, 15].map((percent) => (
              <button
                key={percent}
                onClick={() => handleTipPercentChange(percent)}
                className={`px-4 py-3 text-sm font-medium border rounded-lg transition-all ${
                  tipPercent === percent
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {percent === 0 ? "No Tip" : `${percent}%`}
              </button>
            ))}
          </div>

          {/* Custom tip input */}
          <div className="mt-3">
            <input
              type="number"
              value={customTip}
              onChange={(e) => handleCustomTipChange(e.target.value)}
              placeholder="Custom tip amount (£)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="0.01"
              min="0"
            />
          </div>

          {tip > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Tip: £{(tip / 100).toFixed(2)}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total</span>
            <span className="text-3xl font-bold">
              £{(totalAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Take payment button */}
        <button
          onClick={handleTakePayment}
          disabled={totalAmount <= 0}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
        >
          Take Payment
        </button>
      </div>
    );
  }

  function TapToPayScreen() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Amount display */}
        <div className="mb-8">
          <p className="text-5xl font-bold mb-2">
            £{(totalAmount / 100).toFixed(2)}
          </p>
          <p className="text-gray-600">
            {selectedAppointment
              ? `${selectedAppointment.client.firstName} ${selectedAppointment.client.lastName}`
              : "Custom Payment"}
          </p>
          {selectedAppointment && (
            <p className="text-sm text-gray-500 mt-1">
              {selectedAppointment.services
                .map((s) => s.service.name)
                .join(" + ")}
            </p>
          )}
        </div>

        {/* NFC animation */}
        <div className="relative mb-8">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <svg
              className="w-24 h-24 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-48 h-48 bg-blue-400 rounded-full animate-ping opacity-20" />
        </div>

        <p className="text-xl font-medium mb-2">Tap card or phone</p>
        <p className="text-gray-500">
          Hold card near device to complete payment
        </p>

        {/* Loading spinner */}
        {isProcessing && (
          <div className="mt-8 flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        )}

        {/* Cancel button */}
        <button
          onClick={handleCancelPayment}
          className="mt-8 px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>
      </div>
    );
  }

  function ResultScreen() {
    if (!paymentResult) return null;

    if (paymentResult.success) {
      return (
        <div className="flex flex-col items-center text-center">
          {/* Success animation */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Payment Successful!
          </h2>
          <p className="text-4xl font-bold mb-6">
            £{(paymentResult.amount / 100).toFixed(2)}
          </p>

          {/* Payment details */}
          <div className="w-full bg-gray-50 border rounded-lg p-4 mb-6 text-left">
            {paymentResult.client && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">
                  {paymentResult.client.firstName}{" "}
                  {paymentResult.client.lastName}
                </p>
              </div>
            )}
            {paymentResult.cardBrand && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">
                  {paymentResult.cardBrand} ••••{paymentResult.cardLast4}
                </p>
              </div>
            )}
            {paymentResult.receiptNumber && (
              <div>
                <p className="text-sm text-gray-500">Receipt</p>
                <p className="font-medium">{paymentResult.receiptNumber}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            {paymentResult.client?.email && (
              <button
                onClick={() => handleSendReceipt("email")}
                className="w-full py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Send Receipt via Email
              </button>
            )}
            {paymentResult.client?.phone && (
              <button
                onClick={() => handleSendReceipt("sms")}
                className="w-full py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Send Receipt via SMS
              </button>
            )}
            {selectedAppointment && (
              <button
                onClick={() =>
                  navigate(`/appointments/${selectedAppointment._id}`)
                }
                className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Appointment
              </button>
            )}
            <button
              onClick={handleTakeAnotherPayment}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Another Payment
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center text-center">
          {/* Error animation */}
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {paymentResult.error || "An error occurred"}
          </p>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={() => goToStep(2)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => goToStep(1)}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Choose Different Payment
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }
  }
}
