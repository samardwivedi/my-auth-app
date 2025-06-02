import React from 'react';
import { render, screen, waitFor } from '../../../utils/test-utils';
import HelperReviewList from '../HelperReviewList';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('HelperReviewList', () => {
  const mockReviews = [
    {
      _id: '1',
      rating: 5,
      comment: 'Great service!',
      createdAt: '2024-01-25T12:00:00.000Z',
      userId: {
        name: 'John Doe'
      },
      serviceType: 'Consultation'
    }
  ];

  beforeEach(() => {
    axios.get.mockReset();
  });

  it('renders loading state initially', () => {
    render(<HelperReviewList providerId="123" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders reviews after loading', async () => {
    axios.get.mockResolvedValueOnce({ data: mockReviews });
    
    render(<HelperReviewList providerId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Great service!')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Consultation')).toBeInTheDocument();
    });
  });

  it('renders error message when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<HelperReviewList providerId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load reviews/i)).toBeInTheDocument();
    });
  });

  it('renders no reviews message when there are no reviews', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<HelperReviewList providerId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
    });
  });
}); 