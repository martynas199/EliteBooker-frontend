import Card from "../../shared/components/ui/Card";

export default function CancellationPolicy() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
          Cancellation & Refund Policy
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          View and understand the automated refund policy for appointment
          cancellations
        </p>
      </div>

      {/* Quick Summary Card */}
      <Card>
        <div className="p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                Quick Summary
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Current policy settings
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <h3 className="font-semibold text-green-900">
                  Free Cancellation
                </h3>
              </div>
              <p className="text-sm text-green-800 mb-2">
                24+ hours before appointment
              </p>
              <p className="text-2xl font-bold text-green-900">100% Refund</p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-semibold text-yellow-900">
                  Partial Refund
                </h3>
              </div>
              <p className="text-sm text-yellow-800 mb-2">2-24 hours before</p>
              <p className="text-2xl font-bold text-yellow-900">50% Refund</p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">❌</span>
                <h3 className="font-semibold text-red-900">No Refund</h3>
              </div>
              <p className="text-sm text-red-800 mb-2">Within 2 hours</p>
              <p className="text-2xl font-bold text-red-900">0% Refund</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-semibold text-blue-900">Grace Period</h3>
              </div>
              <p className="text-sm text-blue-800 mb-2">
                Within 15 min of booking
              </p>
              <p className="text-2xl font-bold text-blue-900">100% Refund</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Policy Card */}
      <Card>
        <div className="p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Refund Windows Explained
          </h2>

          <div className="space-y-6">
            {/* Window 1 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Grace Window (100% Refund)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>When:</strong> Cancelled within 15 minutes of
                    booking
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Allows customers to immediately cancel if they made a
                    mistake during booking.
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <strong>Example:</strong> Booked at 10:00 AM, cancelled at
                    10:10 AM → Full refund
                  </div>
                </div>
              </div>
            </div>

            {/* Window 2 */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Free Cancellation (100% Refund)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>When:</strong> Cancelled 24+ hours before
                    appointment
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    No-penalty cancellation for advance notice. Gives the
                    business time to rebook the slot.
                  </p>
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    <strong>Example:</strong> Appointment on Saturday 2:00 PM,
                    cancelled Thursday 1:00 PM (25 hours before) → Full refund
                  </div>
                </div>
              </div>
            </div>

            {/* Window 3 */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Partial Refund (50% Default)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>When:</strong> Cancelled between 2-24 hours before
                    appointment
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Some penalty for late cancellation, but not total loss.
                    Balances customer flexibility with business protection.
                  </p>
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                    <strong>Example:</strong> Appointment on Saturday 2:00 PM,
                    cancelled Saturday 9:00 AM (5 hours before) → 50% refund
                  </div>
                </div>
              </div>
            </div>

            {/* Window 4 */}
            <div className="border-l-4 border-red-500 pl-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No Refund (0%)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>When:</strong> Cancelled within 2 hours of
                    appointment
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Too late to rebook the slot. Full penalty applies to protect
                    the business from last-minute losses.
                  </p>
                  <div className="bg-red-50 p-3 rounded-lg text-sm">
                    <strong>Example:</strong> Appointment on Saturday 2:00 PM,
                    cancelled Saturday 1:30 PM (30 min before) → No refund
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Modes Card */}
      <Card>
        <div className="p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Payment Modes & Refund Base
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Payment Mode
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Refund Base
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      pay_now
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Full payment upfront
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    Full amount (100%)
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      deposit
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Partial payment upfront
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    Deposit amount only*
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                      pay_in_salon
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">No online payment</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    £0 (nothing to refund)
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">
              * Policy setting "appliesTo" can be set to "full" to refund full
              price even with deposit mode
            </p>
          </div>
        </div>
      </Card>

      {/* Examples Card */}
      <Card>
        <div className="p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Refund Calculation Examples
          </h2>

          <div className="space-y-4">
            {/* Example 1 */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Example 1: Pay Now, Early Cancel
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700 mb-1">
                    <strong>Payment Mode:</strong> pay_now
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Amount Paid:</strong> £100
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Appointment:</strong> Monday 10:00 AM
                  </p>
                  <p className="text-gray-700">
                    <strong>Cancel Time:</strong> Saturday 3:00 PM (43 hours
                    before)
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-700 mb-1">
                    <strong>Calculation:</strong>
                  </p>
                  <p className="text-gray-600 text-xs mb-2">
                    Hours to start: 43 → Free cancellation window
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    £100 Refund (100%)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: cancelled_full_refund
                  </p>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Example 2: Deposit, Partial Window
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700 mb-1">
                    <strong>Payment Mode:</strong> deposit
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Deposit Paid:</strong> £25
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Appointment:</strong> Friday 2:00 PM
                  </p>
                  <p className="text-gray-700">
                    <strong>Cancel Time:</strong> Friday 9:00 AM (5 hours
                    before)
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-700 mb-1">
                    <strong>Calculation:</strong>
                  </p>
                  <p className="text-gray-600 text-xs mb-2">
                    Hours to start: 5 → Partial refund window (50%)
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    £12.50 Refund (50%)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: cancelled_partial_refund
                  </p>
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Example 3: Last Minute Cancel
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700 mb-1">
                    <strong>Payment Mode:</strong> deposit
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Deposit Paid:</strong> £30
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Appointment:</strong> Sunday 11:00 AM
                  </p>
                  <p className="text-gray-700">
                    <strong>Cancel Time:</strong> Sunday 10:30 AM (30 min
                    before)
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-700 mb-1">
                    <strong>Calculation:</strong>
                  </p>
                  <p className="text-gray-600 text-xs mb-2">
                    Hours to start: 0.5 → No refund window
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    £0 Refund (0%)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: cancelled_no_refund
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical Details Card */}
      <Card>
        <div className="p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Technical Implementation
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Current Policy Configuration
              </h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg font-mono text-xs overflow-x-auto max-w-full">
                <pre className="text-gray-800 whitespace-pre-wrap break-words sm:whitespace-pre">{`{
  freeCancelHours: 24,      // Full refund if cancelled 24+ hours before
  noRefundHours: 2,         // No refund if cancelled within 2 hours
  partialRefund: {
    percent: 50             // 50% refund in the partial window
  },
  appliesTo: "deposit_only", // "deposit_only" or "full"
  graceMinutes: 15,         // Full refund within 15 min of booking
  currency: "gbp"
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Refund Processing
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Automatic calculation based on cancellation time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Stripe refund processed automatically (idempotent)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Refunds appear in customer's account within 5-10 business
                    days
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Preview available before confirming cancellation</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Code Location
              </h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto">
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  <strong>Backend:</strong>{" "}
                  <code className="text-xs bg-white px-2 py-1 rounded break-all">
                    src/controllers/appointments/computeCancellationOutcome.js
                  </code>
                </p>
                <p className="text-xs sm:text-sm text-gray-700">
                  <strong>Documentation:</strong>{" "}
                  <code className="text-xs bg-white px-2 py-1 rounded break-all">
                    docs/REFUND_POLICY.md
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Best Practices Card */}
      <Card>
        <div className="p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Best Practices
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Do's
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Display policy clearly during checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Include in confirmation emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Show refund preview before cancelling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Consider manual exceptions for emergencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Monitor refund patterns and adjust if needed</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-red-600">✗</span>
                Don'ts
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Don't hide the policy from customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Don't make windows too strict (hurts retention)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Don't process manual refunds without logging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Don't change policy frequently (confusion)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Don't ignore customer feedback on fairness</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Codes Reference */}
      <Card>
        <div className="p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Status Codes Reference
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Status Code
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Meaning
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Refund %
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <code className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      cancelled_full_refund
                    </code>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Cancelled with full refund
                  </td>
                  <td className="py-3 px-4 text-green-600 font-medium">100%</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <code className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      cancelled_partial_refund
                    </code>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Cancelled with partial refund
                  </td>
                  <td className="py-3 px-4 text-yellow-600 font-medium">
                    1-99%
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      cancelled_no_refund
                    </code>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Cancelled with no refund
                  </td>
                  <td className="py-3 px-4 text-red-600 font-medium">0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
