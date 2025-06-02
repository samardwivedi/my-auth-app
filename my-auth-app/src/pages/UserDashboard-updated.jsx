import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import VolunteerTabContent from '../components/VolunteerTabContent';

export default function UserDashboard() {
  // ... other code here

  /*
   * The main part of the component remains the same,
   * this is just a template to show the key changes
   */

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header and Navigation remains the same */}
      
      {/* Overview Tab - remains the same */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards and other content */}
        </>
      )}

      {/* Requests Tab - remains the same */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Requests content */}
        </div>
      )}

      {/* Volunteer Tab - NEW SECTION */}
      {activeTab === 'volunteer' && <VolunteerTabContent />}

      {/* Chats Tab - remains the same */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Chats content */}
        </div>
      )}

      {/* Notifications Tab - remains the same */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Notifications content */}
        </div>
      )}
    </div>
  );
}
