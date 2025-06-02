import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { API_BASE_URL } from '../../config';

export default function PaymentDetailsModal({ isOpen, onClose, payment, onPaymentUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    status: payment?.status || 'pending',
    amount: payment?.amount || 0,
    paymentMethod: payment?.paymentMethod || 'bank_transfer',
    transactionId: payment?.transactionId || '',
    notes: payment?.notes || ''
  });

  // Update form data when payment changes
  React.useEffect(() => {
    if (payment) {
      setFormData({
        status: payment.status || 'pending',
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || 'bank_transfer',
        transactionId: payment.transactionId || '',
        notes: payment.notes || ''
      });
    }
  }, [payment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/payments/${payment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment');
      }
      
      const updatedPayment = await response.json();
      onPaymentUpdated(updatedPayment);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => {
        onClose();
        setIsEditing(false);
        setError('');
      }} 
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
        
        <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-auto z-10">
          {/* Header */}
          <div className={`p-4 ${
            payment.status === 'completed' 
              ? 'bg-green-600' 
              : payment.status === 'pending' 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
          }`}>
            <h2 className="text-xl font-bold text-white">
              Payment Details {isEditing ? '(Editing)' : ''}
            </h2>
            <p className="text-white opacity-90">
              ID: #{payment._id}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input 
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select 
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <input 
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-md ${
                      loading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className={`text-base font-medium ${
                      payment.status === 'completed' 
                        ? 'text-green-600' 
                        : payment.status === 'pending' 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Amount</div>
                    <div className="text-xl font-bold">${payment.amount.toFixed(2)}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="text-base">
                    {payment.paymentMethod.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                </div>
                
                {payment.requestId && (
                  <div>
                    <div className="text-sm text-gray-500">Related Request</div>
                    <div className="text-base">
                      {payment.requestId.userName || 'Unknown'} - {payment.requestId.message.substring(0, 50)}...
                    </div>
                  </div>
                )}
                
                {payment.transactionId && (
                  <div>
                    <div className="text-sm text-gray-500">Transaction ID</div>
                    <div className="text-base">{payment.transactionId}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-gray-500">Created At</div>
                  <div className="text-base">
                    {new Date(payment.createdAt).toLocaleString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                {payment.paymentDate && (
                  <div>
                    <div className="text-sm text-gray-500">Payment Date</div>
                    <div className="text-base">
                      {new Date(payment.paymentDate).toLocaleString('en-US', { 
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
                
                {payment.notes && (
                  <div>
                    <div className="text-sm text-gray-500">Notes</div>
                    <div className="text-base whitespace-pre-line">{payment.notes}</div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-6">
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
