import React, { useEffect, useState } from 'react';
import BeVolunteerForm from './BeVolunteerForm';

const VolunteerTabContent = () => {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Only show if not a volunteer/helper
    setShowForm(user.userType !== 'volunteer' && user.userType !== 'helper');
  }, []);

  return (
    showForm ? <BeVolunteerForm /> : <div className="text-center p-6 text-gray-500">You are already a helper/volunteer.</div>
  );
};

export default VolunteerTabContent;
