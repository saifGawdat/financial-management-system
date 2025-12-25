import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import {
  IoTrashOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

const Settings = () => {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;

    setDeleteError("");
    setIsDeleting(true);

    try {
      const result = await deleteAccount();

      if (result.success) {
        setDeleteSuccess(true);
        // Wait a moment to show success, then redirect
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setDeleteError(result.error);
        setIsDeleting(false);
      }
    } catch {
      setDeleteError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  const resetDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setDeleteError("");
    setIsDeleting(false);
    setDeleteSuccess(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account settings</p>
        </div>

        {/* Danger Zone Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <IoWarningOutline className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
          </div>

          <p className="text-gray-600 mb-6">
            These actions are irreversible. Please proceed with caution.
          </p>

          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <IoTrashOutline size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && !deleteSuccess && resetDeleteModal()}
        title="Delete Account"
      >
        <div className="space-y-4">
          {deleteSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <IoCheckmarkCircle className="text-green-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Account Deleted
              </h3>
              <p className="text-gray-600">
                Your account has been successfully deleted. Redirecting to
                login...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <IoWarningOutline
                  className="text-red-600 flex-shrink-0 mt-0.5"
                  size={24}
                />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    Warning: This action cannot be undone!
                  </h3>
                  <p className="text-sm text-red-700">
                    Deleting your account will permanently remove all your data,
                    including transactions, expenses, and income records.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="delete-confirm"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type <span className="font-bold text-red-600">DELETE</span> to
                  confirm:
                </label>
                <input
                  type="text"
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) =>
                    setDeleteConfirmText(e.target.value.toUpperCase())
                  }
                  placeholder="DELETE"
                  disabled={isDeleting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50"
                />
              </div>

              {deleteError && (
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== "DELETE"}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <IoTrashOutline size={20} />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Settings;
