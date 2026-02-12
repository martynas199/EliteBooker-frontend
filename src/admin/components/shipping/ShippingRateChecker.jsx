import { useState } from "react";
import { getShippingRates, ROYAL_MAIL_SERVICES } from "./shipping.api";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import FormField from "../../../shared/components/forms/FormField";

export default function ShippingRateChecker() {
  const [service, setService] = useState("");
  const [fromPostalCode, setFromPostalCode] = useState("B11AA");
  const [toPostalCode, setToPostalCode] = useState("WC1B3DG");
  const [weight, setWeight] = useState("1.2");
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetRates = async () => {
    setLoading(true);
    setRates([]);
    setError(null);

    const shipmentData = {
      service_codes: service ? [service] : [],
      shipment: {
        ship_from: {
          postal_code: fromPostalCode,
          country_code: "GB",
        },
        ship_to: {
          postal_code: toPostalCode,
          country_code: "GB",
        },
        packages: [
          {
            weight: { value: parseFloat(weight) || 1.0, unit: "kilogram" },
            dimensions: {
              length: 30,
              width: 20,
              height: 10,
              unit: "centimeter",
            },
          },
        ],
      },
    };

    try {
      const data = await getShippingRates(shipmentData);

      if (data.rate_response?.rates) {
        setRates(data.rate_response.rates);
      } else if (data.error) {
        setError(data.error.message || "Failed to get rates");
      } else {
        setError("No rates available");
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error fetching rates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 sm:text-2xl">
        Royal Mail Shipping Rate Checker
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField label="From Postal Code">
          <input
            type="text"
            value={fromPostalCode}
            onChange={(e) => setFromPostalCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="B11AA"
          />
        </FormField>

        <FormField label="To Postal Code">
          <input
            type="text"
            value={toPostalCode}
            onChange={(e) => setToPostalCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="WC1B3DG"
          />
        </FormField>

        <FormField label="Weight (kg)">
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="1.2"
          />
        </FormField>

        <FormField label="Select Service">
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            {ROYAL_MAIL_SERVICES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <Button
        onClick={handleGetRates}
        disabled={loading || !fromPostalCode || !toPostalCode}
        loading={loading}
        fullWidth
        className="mb-6"
      >
        Get Shipping Rates
      </Button>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      )}

      {rates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Rates ({rates.length})
          </h3>
          <div className="space-y-3">
            {rates.map((rate) => (
              <div
                key={rate.rate_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {rate.service_type}
                  </div>
                  <div className="text-sm text-gray-600">
                    {rate.carrier_friendly_name}
                  </div>
                  {rate.estimated_delivery_days && (
                    <div className="text-xs text-gray-500 mt-1">
                      Estimated delivery: {rate.estimated_delivery_days}{" "}
                      business days
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-600">
                    £{rate.shipping_amount.amount}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rate.shipping_amount.currency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && rates.length === 0 && !error && (
        <div className="text-center text-gray-500 py-8">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p>
            Enter postal codes and click "Get Shipping Rates" to see available
            options
          </p>
        </div>
      )}
    </Card>
  );
}
