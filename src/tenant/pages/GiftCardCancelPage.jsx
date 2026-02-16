import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../shared/components/ui/Button";

export default function GiftCardCancelPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-lg text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          !
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your gift card purchase was cancelled and no payment was taken.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to={`/salon/${slug}`}>
            <Button className="w-full">Try Again</Button>
          </Link>
          <Link to={`/salon/${slug}/profile`}>
            <Button className="w-full" variant="outline">
              Go to Profile
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
