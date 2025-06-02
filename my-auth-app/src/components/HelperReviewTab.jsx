import React from 'react';
import HelperReviewList from './HelperReviewList';

export default function HelperReviewTab({ providerId }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Ratings & Reviews</h2>
      <HelperReviewList providerId={providerId} />
    </div>
  );
}
