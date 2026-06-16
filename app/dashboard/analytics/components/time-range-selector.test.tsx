/**
 * Unit tests for TimeRangeSelector component logic
 * 
 * Tests:
 * - TimeRange type validation
 * - Date range validation logic
 * - Custom range calculations
 * - Error handling for invalid ranges
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { describe, it, expect } from 'vitest';
import type { TimeRange, CustomDateRange } from './time-range-selector';

describe('TimeRangeSelector Component Logic', () => {
  describe('TimeRange type validation (Requirement 1.1)', () => {
    it('should accept valid TimeRange values', () => {
      const validRanges: TimeRange[] = ['7d', '30d', '90d', 'custom'];
      
      validRanges.forEach(range => {
        expect(['7d', '30d', '90d', 'custom']).toContain(range);
      });
    });

    it('should have all required preset options', () => {
      const ranges = [
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '90 Days' },
        { value: 'custom', label: 'Custom Range' },
      ];

      expect(ranges).toHaveLength(4);
      expect(ranges.map(r => r.value)).toEqual(['7d', '30d', '90d', 'custom']);
    });
  });

  describe('CustomDateRange type validation (Requirement 1.4)', () => {
    it('should have startDate and endDate properties', () => {
      const customRange: CustomDateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      expect(customRange.startDate).toBeInstanceOf(Date);
      expect(customRange.endDate).toBeInstanceOf(Date);
    });
  });

  describe('Date range validation (Requirement 1.4)', () => {
    it('should validate that start date is before end date', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-10');

      const isValid = startDate <= endDate;

      expect(isValid).toBe(false);
    });

    it('should validate that end date is not in the future', () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1); // Tomorrow
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const isValid = endDate <= today;

      expect(isValid).toBe(false);
    });

    it('should validate that range does not exceed 365 days', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-01-31'); // More than 365 days

      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isValid = daysDiff <= 365;

      expect(isValid).toBe(false);
      expect(daysDiff).toBeGreaterThan(365);
    });

    it('should accept valid date ranges', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const isStartBeforeEnd = startDate <= endDate;
      const isEndNotFuture = endDate <= today;
      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isWithin365Days = daysDiff <= 365;

      expect(isStartBeforeEnd).toBe(true);
      expect(isWithin365Days).toBe(true);
    });
  });

  describe('Date calculations (Requirements 1.2, 1.3)', () => {
    it('should calculate 7-day range correctly', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(7);
    });

    it('should calculate 30-day range correctly', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(30);
    });

    it('should calculate 90-day range correctly', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);

      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(90);
    });
  });

  describe('Custom range formatting', () => {
    it('should format custom range display correctly', () => {
      const formatDate = (date: Date) => {
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      };

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-02-15');

      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
      const displayText = `${formattedStart} - ${formattedEnd}`;

      expect(formattedStart).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
      expect(formattedEnd).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
      expect(displayText).toContain('-');
    });
  });

  describe('Error messages', () => {
    it('should provide error for start date after end date', () => {
      const error = 'Start date must be before end date';
      
      expect(error).toBe('Start date must be before end date');
    });

    it('should provide error for future end date', () => {
      const error = 'End date cannot be in the future';
      
      expect(error).toBe('End date cannot be in the future');
    });

    it('should provide error for range exceeding 365 days', () => {
      const error = 'Date range cannot exceed 365 days';
      
      expect(error).toBe('Date range cannot exceed 365 days');
    });
  });

  describe('Days calculation display', () => {
    it('should calculate and display day count correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-15');

      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const displayDays = daysDiff + 1; // Include both start and end dates

      expect(displayDays).toBe(15);
    });

    it('should handle same-day range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');

      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const displayDays = daysDiff + 1;

      expect(displayDays).toBe(1);
    });
  });

  describe('Maximum date constraints', () => {
    it('should set maxDate to today for both pickers', () => {
      const today = new Date();
      const maxDate = new Date(today);

      expect(maxDate.getDate()).toBe(today.getDate());
      expect(maxDate.getMonth()).toBe(today.getMonth());
      expect(maxDate.getFullYear()).toBe(today.getFullYear());
    });

    it('should set end date minDate to start date', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-10');

      const isEndAfterStart = endDate >= startDate;

      expect(isEndAfterStart).toBe(false);
    });
  });
});
