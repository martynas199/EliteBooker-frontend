import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";

export default function MenuPage() {
  // Test with no hooks first
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'red', 
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: 'white', fontSize: '32px' }}>MENU PAGE LOADED</h1>
    </div>
  );
}
