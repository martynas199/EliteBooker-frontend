import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";

export default function MenuPage() {
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Force page to top and prevent scroll
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#fee",
          padding: "20px",
          overflow: "auto",
          zIndex: 9999,
        }}
      >
        <h1 style={{ color: "red" }}>Error: {error}</h1>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: "20px", padding: "10px" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: 600 }}>Menu</h1>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            borderRadius: "999px",
          }}
        >
          <svg
            style={{ width: "24px", height: "24px" }}
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

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <ProfileMenu
          client={client}
          onLogout={handleLogout}
          variant="mobile"
          onGiftCardClick={() => setShowGiftCardModal(true)}
        />
      </div>

      {/* Gift Card Modal */}
      {showGiftCardModal && (
        <GiftCardModal
          isOpen={showGiftCardModal}
          onClose={() => setShowGiftCardModal(false)}
          onSuccess={(giftCard) => {}}
        />
      )}
    </div>
  );
}
