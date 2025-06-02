import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function BeHelperForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Validation state
  const [fieldErrors, setFieldErrors] = useState({});

  // Step 1: Personal Info
  const validateStep1 = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^([+]?\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
      errors.phone = 'Enter a valid phone number (10 digits)';
    }
    if (!photo) errors.photo = 'Profile photo is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
        <input type="text" className={`w-full border rounded p-2 ${fieldErrors.fullName ? 'border-red-500' : ''}`} value={fullName} onChange={e => setFullName(e.target.value)} />
        {fieldErrors.fullName && <div className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
        <input type="email" className={`w-full border rounded p-2 ${fieldErrors.email ? 'border-red-500' : ''}`} value={email} onChange={e => setEmail(e.target.value)} />
        {fieldErrors.email && <div className="text-red-500 text-sm mt-1">{fieldErrors.email}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Phone <span className="text-red-500">*</span></label>
        <input type="tel" className={`w-full border rounded p-2 ${fieldErrors.phone ? 'border-red-500' : ''}`} value={phone} onChange={e => setPhone(e.target.value)} />
        {fieldErrors.phone && <div className="text-red-500 text-sm mt-1">{fieldErrors.phone}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Profile Photo <span className="text-red-500">*</span></label>
        <input type="file" accept="image/*" onChange={e => {
          const file = e.target.files[0];
          setPhoto(file);
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
          } else {
            setPhotoPreview(null);
          }
        }} />
        {fieldErrors.photo && <div className="text-red-500 text-sm mt-1">{fieldErrors.photo}</div>}
        {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full border" />}
      </div>
      <div className="flex justify-end mt-8">
        <button type="button" className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-8 rounded-lg font-medium" onClick={() => {
          if (validateStep1()) setStep(2);
        }}>
          Next
        </button>
      </div>
    </div>
  );

  // Step 2: Skills & Specializations
  const [skillInput, setSkillInput] = useState('');
  const [specInput, setSpecInput] = useState('');
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));
  const addSpec = () => {
    if (specInput.trim() && !specializations.includes(specInput.trim())) {
      setSpecializations([...specializations, specInput.trim()]);
      setSpecInput('');
    }
  };
  const removeSpec = (s) => setSpecializations(specializations.filter(x => x !== s));

  const validateStep2 = () => {
    const errors = {};
    if (!skills.length) errors.skills = 'Please add at least one skill';
    if (!bio.trim()) errors.bio = 'Short bio is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderStep2 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Skills & Specializations</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Skills <span className="text-red-500">*</span></label>
        <div className="flex gap-2 mb-2">
          <input type="text" className="border rounded p-2 flex-1" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), addSkill()) : null} placeholder="Add a skill" />
          <button type="button" className="bg-primary-600 text-white px-4 rounded" onClick={addSkill}>Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <span key={s} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full flex items-center gap-1">{s} <button type="button" className="ml-1 text-red-500" onClick={() => removeSkill(s)}>&times;</button></span>
          ))}
        </div>
        {fieldErrors.skills && <div className="text-red-500 text-sm mt-1">{fieldErrors.skills}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Specializations</label>
        <div className="flex gap-2 mb-2">
          <input type="text" className="border rounded p-2 flex-1" value={specInput} onChange={e => setSpecInput(e.target.value)} onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), addSpec()) : null} placeholder="Add a specialization" />
          <button type="button" className="bg-primary-600 text-white px-4 rounded" onClick={addSpec}>Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {specializations.map(s => (
            <span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full flex items-center gap-1">{s} <button type="button" className="ml-1 text-red-500" onClick={() => removeSpec(s)}>&times;</button></span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Short Bio <span className="text-red-500">*</span></label>
        <textarea className={`w-full border rounded p-2 min-h-[80px] ${fieldErrors.bio ? 'border-red-500' : ''}`} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself, your experience, and why you want to help." />
        {fieldErrors.bio && <div className="text-red-500 text-sm mt-1">{fieldErrors.bio}</div>}
      </div>
      <div className="flex justify-between mt-8">
        <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-8 rounded-lg font-medium" onClick={() => setStep(1)}>
          Back
        </button>
        <button type="button" className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-8 rounded-lg font-medium" onClick={() => {
          if (validateStep2()) setStep(3);
        }}>
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: Review & Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Final validation before submit
    if (!validateStep1() || !validateStep2()) {
      setError('Please complete all required fields before submitting.');
      return;
    }
    setLoading(true);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to become a helper');
        setLoading(false);
        return;
      }
      
      let photoUrl = '';
      
      // First upload the profile photo
      if (photo) {
        const formData = new FormData();
        formData.append('profilePhoto', photo);
        
        try {
          const uploadResponse = await axios.post(
            `${API_BASE_URL}/api/auth/upload-profile-photo`,
            formData,
            {
              headers: {
                'x-auth-token': token,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (uploadResponse.data.success) {
            photoUrl = uploadResponse.data.photoUrl;
            console.log('Photo uploaded successfully:', photoUrl);
          }
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          setError('Failed to upload profile photo. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Then update the user status to volunteer
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update-volunteer-status`,
        {
          userType: 'volunteer',
          skills: skills,
          bio: bio,
          specializations: specializations,
          providerSince: new Date().toISOString(),
          isAvailable: true,
          photoUrl: photoUrl // Include the photoUrl in the update
        },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update user data in localStorage
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Dispatch auth state change event with proper data
      window.dispatchEvent(new CustomEvent('auth:stateChanged', {
        detail: { isAuthenticated: true, user: userData }
      }));
      
      setLoading(false);
      setSuccess(true);
      
      // Redirect to volunteer dashboard after a short delay
      setTimeout(() => {
        navigate('/volunteer-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error submitting helper application:', error);
      setError(error.response?.data?.error || 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };
  const renderStep3 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review & Submit</h2>
      <div className="mb-4 flex items-center gap-4">
        {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-full border" />}
        <div>
          <div className="font-bold text-lg">{fullName}</div>
          <div className="text-gray-600">{email}</div>
          <div className="text-gray-600">{phone}</div>
        </div>
      </div>
      <div className="mb-4">
        <b>Skills:</b> {skills.join(', ')}
      </div>
      <div className="mb-4">
        <b>Specializations:</b> {specializations.join(', ') || 'None'}
      </div>
      <div className="mb-4">
        <b>Bio:</b> <div className="text-gray-700 mt-1 whitespace-pre-line">{bio}</div>
      </div>
      <div className="flex justify-between mt-8">
        <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-8 rounded-lg font-medium" onClick={() => setStep(2)}>
          Back
        </button>
        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-8 rounded-lg font-medium" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Thank you for applying!</h2>
        <p className="mb-4">Your application to become a helper has been received. We will review your details and contact you soon.</p>
      <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium" onClick={() => navigate('/volunteer-dashboard')}>Go to Helper Dashboard</button>
      </div>
    );
  }

  return (
    <form className="max-w-xl mx-auto mt-10 mb-10 bg-white rounded-2xl shadow-2xl p-8" onSubmit={handleSubmit}>
      <h1 className="text-4xl font-extrabold text-center text-primary-700 mb-10 tracking-tight drop-shadow-lg">Become a Helper</h1>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary-600 font-bold text-lg">Step {step} of 3</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all" style={{ width: `${step * 33.33}%` }}></div>
          </div>
        </div>
      </div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </form>
  );
}
