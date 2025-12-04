import { useAuth } from "../../shared/contexts/AuthContext";
import Card from "../../shared/components/ui/Card";

export default function TokenDebugPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">User:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold">Cookies:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {document.cookie || "No cookies"}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
