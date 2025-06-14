import { render, fireEvent, screen } from '@testing-library/react';
import Donation from './donation';
import { jest } from '@jest/globals';
import toast from 'sonner';

describe('Donation Form', () => {
  jest.mock('sonner');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should submit form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    const { getByText, getByLabelText, getByRole } = render(<Donation />);

    const.fullName = 'John Doe';
    const email = 'john@example.com';
    const phoneNumber = '09023456789';
    const message = 'Test message';

    // Fill form
    fireEvent.change(getByLabelText('Full Name'), { target: { value: fullName } });
    fireEvent.change(getByLabelText('Email Address'), { target: { value: email } });
    fireEvent.change(getByLabelText('Phone Number'), { target: { value: phoneNumber } });
    fireEvent.change(getByLabelText('Message'), { target: { value: message } });
    
    // Click submit button
    const submitButton = getByRole('button', { type: 'submit' });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      amount: 0,
      fullName,
      email,
      phoneNumber,
      message,
      terms: false
    });
  });

  it('should handle empty form submission', () => {
    const { queryByText } = render(<Donation />);

    const submitButton = screen.getByRole('button', { type: 'submit' });
    fireEvent.click(submitButton);

    expect(queryByText('This field is required')).toBeInTheDocument();
  });

  it('should copy account number to clipboard', () => {
    const { getByRole } = render(<Donation />);
    const copyButton = getByRole('button', { name: 'Copy' });

    const mockClipboardWriteText = jest.fn();
    jest.mock('clipboard-write', () => ({
      writeText: mockClipboardWriteText
    }));

    fireEvent.click(copyButton);

    expect(mockClipboardWriteText).toHaveBeenCalledWith('0002923259');
    expect(toast.success).toHaveBeenCalledWith('Copied to clipboard');
  });
});