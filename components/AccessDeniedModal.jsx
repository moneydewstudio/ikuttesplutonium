import React from 'react';

export default function AccessDeniedModal({ open }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">Access Denied</h2>
        <p className="mb-6">You do not have permission to access this page. Please contact the administrator if you believe this is an error.</p>
      </div>
    </div>
  );
}
