import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import TenantAccountLayout from "../../tenant/components/TenantAccountLayout";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";
import { useState } from "react";

export default function ClientAccountPageShell({
  title,
  description,
  children,
}) {
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.replace("/");
    } catch (error) {
      window.location.replace("/");
    }
  };

  return (
    <>
      <TenantAccountLayout
        sidebar={
          <ProfileMenu
            client={client}
            onLogout={handleLogout}
            variant="sidebar"
            onGiftCardClick={() => setShowGiftCardModal(true)}
          />
        }
        title={title}
        description={description}
        onBack={() => navigate(-1)}
      >
        {children}
      </TenantAccountLayout>

      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={() => {}}
      />
    </>
  );
}
