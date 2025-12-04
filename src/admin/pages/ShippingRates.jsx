import ShippingRateChecker from "../components/shipping/ShippingRateChecker";

export default function ShippingRates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Shipping Rate Calculator
        </h1>
        <p className="text-gray-600">
          Calculate Royal Mail shipping costs for orders
        </p>
      </div>

      <ShippingRateChecker />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          📦 How to use this tool
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter the origin and destination postal codes</li>
          <li>• Set the package weight in kilograms</li>
          <li>
            • Select a specific Royal Mail service or choose "Any available
            service"
          </li>
          <li>
            • Click "Get Shipping Rates" to see available options and costs
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">⚙️ Configuration</h3>
        <p className="text-sm text-amber-800 mb-2">
          To enable automatic shipping calculations, add your ShipEngine API key
          to the environment variables:
        </p>
        <code className="block bg-amber-100 text-amber-900 px-3 py-2 rounded text-xs">
          SHIPENGINE_API_KEY=your_api_key_here
        </code>
        <p className="text-xs text-amber-700 mt-2">
          Without an API key, the system will use a fixed £4.99 shipping cost as
          fallback.
        </p>
      </div>
    </div>
  );
}
