import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";

export default function MenuPage() {
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold">{client?.name || "Menu"}</h1>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close menu"
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

      {/* Profile Menu Content */}
      <ProfileMenu
        client={client}
        onLogout={handleLogout}
        variant="mobile"
        onGiftCardClick={() => setShowGiftCardModal(true)}
      />

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={(giftCard) => {
          console.log("Gift card created:", giftCard);
        }}
      />
    </div>
  );
}
