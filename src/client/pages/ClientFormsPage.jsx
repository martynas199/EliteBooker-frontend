import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { api } from '../../shared/lib/apiClient';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ClientFormsPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch consent records for logged-in client
      const response = await api.get('/consents/my-forms');
      setForms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError(error.response?.data?.message || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async (consentId) => {
    try {
      const response = await api.get(`/consents/${consentId}/pdf`);
      
      if (response.data.signedUrl) {
        window.open(response.data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to view PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your forms...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchForms}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Consent Forms</h1>
          <p className="text-gray-600">
            View and download your signed consent forms
          </p>
        </div>

        {/* Forms List */}
        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Forms Yet
            </h3>
            <p className="text-gray-600">
              You haven't signed any consent forms yet. Consent forms will appear here after you complete them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Form Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {form.templateName}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Signed
                      </span>
                    </div>

                    {/* Form Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>
                          Signed: {format(new Date(form.signedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          Version: {form.templateVersion}
                        </span>
                      </div>

                      {form.appointmentId && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">For appointment</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>
                          Signed by: {form.signedByName}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    {form.status === 'revoked' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Revoked:</strong> This consent has been revoked on{' '}
                          {format(new Date(form.revokedAt), 'MMM d, yyyy')}
                        </p>
                        {form.revocationReason && (
                          <p className="text-sm text-yellow-700 mt-1">
                            Reason: {form.revocationReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewPDF(form._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">About Consent Forms</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All signed consent forms are securely stored and encrypted</li>
            <li>• You can download PDFs of your signed forms at any time</li>
            <li>• Forms are kept for 7 years for legal compliance</li>
            <li>• You may be required to sign additional forms for specific treatments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
