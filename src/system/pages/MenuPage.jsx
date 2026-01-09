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

  // Simple test render first
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'white', 
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f0f0f0',
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Menu Page Test</h1>
        <p style={{ marginBottom: '10px' }}>Client exists: {client ? 'YES' : 'NO'}</p>
        {client && <p>Client name: {client.name}</p>}
        <button 
          onClick={() => navigate(-1)}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
