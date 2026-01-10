import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";

export default function SearchPageSimple() {
  console.log('[SearchPageSimple] Component executing');
  
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    console.log('[SearchPageSimple] Mounted');
    
    // Force page to top and prevent scroll
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    
    fetchVenues();
    
    return () => {
      console.log('[SearchPageSimple] Unmounting');
      document.body.style.overflow = '';
    };
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await api.get("/tenants/public");
      if (response.data.success && Array.isArray(response.data.tenants)) {
        setVenues(response.data.tenants);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      venue.name?.toLowerCase().includes(searchLower) ||
      venue.businessName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ff0000',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      <h1 style={{ 
        color: 'white', 
        fontSize: '48px', 
        padding: '50px',
        textAlign: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000
      }}>
        SEARCH PAGE TEST
      </h1>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
        backgroundColor: 'white'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <svg
            style={{ width: '24px', height: '24px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        padding: '16px'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #7c3aed',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <p>No businesses found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredVenues.map((venue) => (
              <Link
                key={venue._id}
                to={`/salon/${venue.slug}`}
                style={{
                  display: 'block',
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#111'
                }}>
                  {venue.businessName || venue.name}
                </h3>
                {venue.address && (
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    {typeof venue.address === 'string' 
                      ? venue.address 
                      : [venue.address.street, venue.address.city, venue.address.postalCode]
                          .filter(Boolean)
                          .join(', ')
                    }
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
