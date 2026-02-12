import ShippingRateChecker from "../components/shipping/ShippingRateChecker";
import AdminPageShell from "../components/AdminPageShell";

export default function ShippingRates() {
  return (
    <AdminPageShell
      title="Shipping Rate Calculator"
      description="Calculate Royal Mail shipping costs for orders"
      maxWidth="md"
    >

      <ShippingRateChecker />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="mb-2 font-semibold text-blue-900">How to use this tool</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Enter the origin and destination postal codes</li>
          <li>Set the package weight in kilograms</li>
          <li>
            Select a specific Royal Mail service or choose "Any available
            service"
          </li>
          <li>Click "Get Shipping Rates" to see available options and costs</li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="mb-2 font-semibold text-amber-900">Configuration</h3>
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
    </AdminPageShell>
  );
}
