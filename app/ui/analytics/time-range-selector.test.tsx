import { describe, it, expect } from 'vitest';

// Date range validation helper (extracted from component for testing)
function validateDateRange(startDate: Date, endDate: Date): string | null {
  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid date format';
  }
  
  // Start date must be before end date
  if (startDate > endDate) {
    return 'Start date must be before end date';
  }
  
  // End date cannot be in the future
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (endDate > today) {
    return 'End date cannot be in the future';
  }
  
  // Maximum span of 365 days
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 365) {
    return 'Date range cannot exceed 365 days';
  }
  
  return null;
}

describe('TimeRangeSelector validation logic', () => {
  describe('Date range validation', () => {
    it('accepts valid date range within 365 days', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBeNull();
    });
    
    it('rejects date range where start is after end', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBe('Start date must be before end date');
    });
    
    it('rejects date range exceeding 365 days', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-02-01'); // 397 days
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBe('Date range cannot exceed 365 days');
    });
    
    it('accepts date range of exactly 365 days', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31'); // 365 days in a leap year
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBeNull();
    });
    
    it('rejects invalid start date', () => {
      const startDate = new Date('invalid');
      const endDate = new Date('2024-01-31');
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBe('Invalid date format');
    });
    
    it('rejects invalid end date', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('invalid');
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBe('Invalid date format');
    });
  });
  
  describe('Future date validation', () => {
    it('rejects end date in the future', () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 7 days in future
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBe('End date cannot be in the future');
    });
    
    it('accepts end date as today', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBeNull();
    });
  });
  
  describe('Edge cases', () => {
    it('accepts single day range (start = end)', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBeNull();
    });
    
    it('accepts 30-day range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-30');
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBeNull();
    });
    
    it('accepts 90-day range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');
      
      const error = validateDateRange(startDate, endDate);
      
      expect(error).toBeNull();
    });
  });
});
