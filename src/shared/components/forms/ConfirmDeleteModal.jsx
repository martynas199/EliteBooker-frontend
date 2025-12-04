/**
 * ConfirmDeleteModal - Reusable confirmation modal for delete actions
 *
 * @example
 * <ConfirmDeleteModal
 *   isOpen={showDeleteConfirm}
 *   itemName="Haircut Service"
 *   itemType="service"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDeleteConfirm(false)}
 *   isDeleting={isSubmitting}
 * />
 */
export function ConfirmDeleteModal({
  isOpen,
  itemName,
  itemType = "item",
  onConfirm,
  onCancel,
  isDeleting = false,
  message,
  disabled = false,
}) {
  if (!isOpen) return null;

  const defaultMessage = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3
              id="delete-modal-title"
              className="text-lg font-bold text-gray-900 mb-2"
            >
              Confirm Deletion
            </h3>
            <p className="text-gray-600 text-sm">{message || defaultMessage}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          {!disabled && (
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors order-1 sm:order-2"
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
