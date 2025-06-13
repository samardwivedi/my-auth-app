import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Bengali', 'Marathi', 'Telugu', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Other'
];

const SKILLS = [
  'Electrician', 'Plumber', 'Carpenter', 'Doctor', 'Nurse', 'Teacher', 'Driver', 'Cook', 'Cleaner', 'Babysitter', 'Elderly Care', 'IT Support', 'Mechanic', 'Other'
];

const languageOptions = LANGUAGES.map(l => ({ value: l, label: l }));

function FileDropzone({ onDrop, file, label, accept, ariaLabel, error }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => onDrop(acceptedFiles[0]),
    accept,
    multiple: false
  });
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'} ${error ? 'border-red-500' : ''}`} aria-label={ariaLabel}>
      <input {...getInputProps()} />
      <p className="text-sm text-gray-600">{label}</p>
      {file && (
        <div className="mt-2 flex flex-col items-center">
          {file.type && file.type.startsWith('image') ? (
            <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 object-cover rounded-full mb-1" />
          ) : (
            <span className="text-xs text-gray-700">{file.name}</span>
          )}
        </div>
      )}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}

const BeHelperForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    skills: '',
    specializations: '',
    experience: '',
    emergencyAvailability: false,
    maxRequestsPerDay: '',
    languages: [],
    bio: '',
    serviceAreas: '',
    termsAccepted: false
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inlineErrors, setInlineErrors] = useState({});

  // Tag input for skills
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Autofill name/email from logged-in user
  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        setFormData(prev => ({
          ...prev,
          fullName: user.name || '',
          email: user.email || ''
        }));
      } catch (e) {}
    }
  }, []);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      error = 'Invalid email address.';
    }
    if (name === 'phone' && value && !/^[0-9]{10,}$/.test(value.replace(/\D/g, ''))) {
      error = 'Invalid phone number.';
    }
    if (name === 'fullName' && !value) error = 'Full name is required.';
    if (name === 'address' && !value) error = 'Address is required.';
    if (name === 'bio' && !value) error = 'Bio is required.';
    if (name === 'serviceAreas' && !value) error = 'Service area is required.';
    if (name === 'skills' && (!value || value.length === 0)) error = 'At least one skill is required.';
    if (name === 'languages' && (!value || value.length === 0)) error = 'At least one language is required.';
    if (name === 'profilePhoto' && !value) error = 'Profile photo is required.';
    if (name === 'termsAccepted' && !value) error = 'You must accept the terms.';
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    setInlineErrors(prev => ({ ...prev, [name]: validateField(name, val) }));
  };

  // Tag input for skills
  const handleSkillsChange = (selected) => {
    setFormData(prev => ({ ...prev, skills: selected.map(s => s.value).join(', ') }));
    setSkillsOptions(selected);
    setInlineErrors(prev => ({ ...prev, skills: selected.length === 0 ? 'At least one skill is required.' : '' }));
  };

  const handleLanguagesChange = (selected) => {
    setFormData(prev => ({ ...prev, languages: selected.map(s => s.value) }));
    setInlineErrors(prev => ({ ...prev, languages: selected.length === 0 ? 'Select at least one language.' : '' }));
  };

  // File dropzone handlers
  const handleProfilePhotoDrop = (file) => setProfilePhoto(file);

  const validateStep1 = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'languages', 'bio'];
    let errors = {};
    requiredFields.forEach((k) => {
      const v = formData[k];
      const err = validateField(k, v);
      if (err) errors[k] = err;
    });
    // Profile photo required
    if (!profilePhoto) errors.profilePhoto = 'Profile photo is required.';
    setInlineErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    let errors = {};
    Object.entries(formData).forEach(([k, v]) => {
      const err = validateField(k, v);
      if (err) errors[k] = err;
    });
    setInlineErrors(errors);
    if (Object.keys(errors).length > 0 && Object.values(errors).some(Boolean)) {
      setError('Please fix the errors above.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => form.append(key, v));
        } else {
          form.append(key, value);
        }
      });
      if (profilePhoto) form.append('profilePhoto', profilePhoto);

      const response = await fetch(`${API_BASE_URL}/api/helpers`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: form
      });

      if (!response.ok) {
        throw new Error('Failed to submit helper application');
      }
      setSuccess(true);
      setFormData({
        fullName: '', email: '', phone: '', address: '', skills: '', specializations: '', experience: '', emergencyAvailability: false, maxRequestsPerDay: '', languages: [], bio: '', serviceAreas: '', termsAccepted: false
      });
      setProfilePhoto(null);

      // Update userType in localStorage if user exists
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          user.userType = 'volunteer';
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {}
      }
      // Redirect after a short delay for animation
      setTimeout(() => {
        navigate('/volunteer-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-2 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 md:p-8 transition-colors duration-300">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100 animate-fade-in">Become a Helper</h2>
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-3 mb-4 rounded animate-fade-in">{error}</div>
        )}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center border-2 border-green-500 animate-pop-in">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Thank you!</div>
              <div className="mb-4 text-gray-700 dark:text-gray-200">Your application is under review. You’ll be notified once approved.</div>
              <button className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded shadow hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors" onClick={() => setSuccess(false)}>Close</button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in" encType="multipart/form-data" aria-label="Helper Application Form">
          {step === 1 && (
            <>
              {/* 1. Personal Information + Languages & Bio */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {/* Row 1 */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name<span className="text-red-500">*</span></label>
                    <input id="fullName" aria-label="Full Name" type="text" name="fullName" value={formData.fullName} onChange={handleChange} required readOnly disabled className={`mt-1 block w-full border rounded-lg p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all ${inlineErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} cursor-not-allowed`} />
                    {inlineErrors.fullName && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.fullName}</div>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address<span className="text-red-500">*</span></label>
                    <input id="email" aria-label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required readOnly disabled className={`mt-1 block w-full border rounded-lg p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all ${inlineErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} cursor-not-allowed`} />
                    {inlineErrors.email && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.email}</div>}
                  </div>
                  {/* Row 2 */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number<span className="text-red-500">*</span></label>
                    <input id="phone" aria-label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={`mt-1 block w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all ${inlineErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                    {inlineErrors.phone && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.phone}</div>}
                  </div>
                  <div>
                    <FileDropzone onDrop={handleProfilePhotoDrop} file={profilePhoto} label="Profile Photo (Required)" accept={{'image/*': []}} ariaLabel="Profile Photo Upload" error={inlineErrors.profilePhoto} />
                    {inlineErrors.profilePhoto && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.profilePhoto}</div>}
                  </div>
                  {/* Row 3 */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location / Address<span className="text-red-500">*</span></label>
                    <input id="address" aria-label="Location or Address" type="text" name="address" value={formData.address} onChange={handleChange} required className={`mt-1 block w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all ${inlineErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                    {inlineErrors.address && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.address}</div>}
                  </div>
                </div>
                {/* Languages & Bio (moved up) */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div>
                    <label htmlFor="languages" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Languages Spoken<span className="text-red-500">*</span></label>
                    <Select
                      inputId="languages"
                      aria-label="Languages Spoken"
                      isMulti
                      name="languages"
                      value={formData.languages.map(l => ({ value: l, label: l }))}
                      onChange={handleLanguagesChange}
                      options={languageOptions}
                      placeholder="Select languages..."
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          backgroundColor: 'var(--tw-bg-opacity,1) #f9fafb',
                          borderColor: state.isFocused ? '#2563eb' : '#374151',
                          color: '#111827',
                          boxShadow: state.isFocused ? '0 0 0 2px #2563eb33' : undefined,
                          transition: 'all 0.2s',
                        }),
                        menu: base => ({ ...base, backgroundColor: '#fff', color: '#111827', zIndex: 50 }),
                        singleValue: base => ({ ...base, color: '#111827' }),
                        multiValue: base => ({ ...base, backgroundColor: '#2563eb22', color: '#111827' }),
                      }}
                      theme={theme => ({
                        ...theme,
                        borderRadius: 8,
                        colors: {
                          ...theme.colors,
                          primary25: '#2563eb22',
                          primary: '#2563eb',
                          neutral0: 'var(--tw-bg-opacity,1) #f9fafb',
                          neutral80: '#111827',
                          neutral90: '#fff',
                        },
                      })}
                    />
                    {inlineErrors.languages && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.languages}</div>}
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Short Bio / Motivation<span className="text-red-500">*</span></label>
                    <textarea id="bio" aria-label="Short Bio" name="bio" value={formData.bio} onChange={handleChange} required rows="3" placeholder="Describe your background, motivation, and approach." className={`mt-1 block w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all ${inlineErrors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                    {inlineErrors.bio && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.bio}</div>}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              {/* 2. Skills & Experience + Service Area (no certificate/id/max requests) */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Skills & Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {/* Row 1 */}
                  <div>
                    <label htmlFor="skills" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Skills Offered<span className="text-red-500">*</span></label>
                    <Select
                      inputId="skills"
                      aria-label="Skills Offered"
                      isMulti
                      name="skills"
                      value={skillsOptions}
                      onChange={handleSkillsChange}
                      options={SKILLS.map(s => ({ value: s, label: s }))}
                      placeholder="E.g., Electrician, Plumbing, Teaching"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          backgroundColor: 'var(--tw-bg-opacity,1) #f9fafb',
                          borderColor: state.isFocused ? '#2563eb' : '#374151',
                          color: '#111827',
                          boxShadow: state.isFocused ? '0 0 0 2px #2563eb33' : undefined,
                          transition: 'all 0.2s',
                        }),
                        menu: base => ({ ...base, backgroundColor: '#fff', color: '#111827', zIndex: 50 }),
                        singleValue: base => ({ ...base, color: '#111827' }),
                        multiValue: base => ({ ...base, backgroundColor: '#2563eb22', color: '#111827' }),
                      }}
                      theme={theme => ({
                        ...theme,
                        borderRadius: 8,
                        colors: {
                          ...theme.colors,
                          primary25: '#2563eb22',
                          primary: '#2563eb',
                          neutral0: 'var(--tw-bg-opacity,1) #f9fafb',
                          neutral80: '#111827',
                          neutral90: '#fff',
                        },
                      })}
                    />
                    {inlineErrors.skills && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.skills}</div>}
                  </div>
                  <div>
                    <label htmlFor="specializations" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Specializations</label>
                    <input id="specializations" aria-label="Specializations" type="text" name="specializations" value={formData.specializations} onChange={handleChange} placeholder="E.g., Residential wiring, Elderly care" className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all" />
                  </div>
                  {/* Row 2 */}
                  <div>
                    <label htmlFor="experience" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Experience (in years)</label>
                    <input id="experience" aria-label="Experience in years" type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all" />
                  </div>
                  <div className="flex items-center mt-2 md:mt-0">
                    <input id="emergencyAvailability" aria-label="Emergency Availability" type="checkbox" name="emergencyAvailability" checked={formData.emergencyAvailability} onChange={handleChange} className="mr-2 h-5 w-5 accent-blue-600 dark:accent-blue-500" />
                    <label htmlFor="emergencyAvailability" className="text-xs font-medium text-gray-500 dark:text-gray-400">Emergency Availability</label>
                  </div>
                </div>
                {/* Service Area */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div>
                    <label htmlFor="serviceAreas" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Areas You Can Serve<span className="text-red-500">*</span></label>
                    <input id="serviceAreas" aria-label="Service Areas" type="text" name="serviceAreas" value={formData.serviceAreas} onChange={handleChange} required placeholder="E.g., South Delhi, Connaught Place" className={`mt-1 block w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition-all ${inlineErrors.serviceAreas ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                    {inlineErrors.serviceAreas && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.serviceAreas}</div>}
                  </div>
                </div>
                {/* 3. Agreement & Submission */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Agreement & Submission</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-4 border border-gray-300 dark:border-gray-700 flex items-center">
                    <input id="termsAccepted" aria-label="Agree to terms" type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} required className="mr-2 h-5 w-5 accent-blue-600 dark:accent-blue-500" />
                    <label className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-300" htmlFor="termsAccepted">
                      I agree to the <a href="/terms" className="underline text-blue-600 dark:text-blue-400" target="_blank" rel="noopener noreferrer">terms of service</a> and <a href="/privacy" className="underline text-blue-600 dark:text-blue-400" target="_blank" rel="noopener noreferrer">privacy policy</a>.<span className="text-red-500">*</span>
                    </label>
                  </div>
                  {inlineErrors.termsAccepted && <div className="text-xs text-red-500 mt-1 animate-shake">{inlineErrors.termsAccepted}</div>}
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-2/3 py-3 px-4 border border-transparent rounded-lg shadow text-base font-semibold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Submit Application"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default BeHelperForm;