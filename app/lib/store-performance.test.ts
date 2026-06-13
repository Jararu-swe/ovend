import { describe, expect, test, beforeEach, vi } from 'vitest';
import { normalizeHours } from './store-availability';

// Mock the database module sql
const { sql: mockSql, setMockResults } = vi.hoisted(() => {
  let mockResults: any[] = [];
  const fn = vi.fn((strings, ...values) => {
    const queryText = strings && strings[0] ? strings[0] : '';
    const isMainQuery = queryText.trim().toUpperCase().startsWith('SELECT');

    if (isMainQuery) {
      return Promise.resolve(mockResults);
    }

    return {
      strings,
      values,
      _isFragment: true
    };
  });

  return {
    sql: Object.assign(fn, {
      unsafe: vi.fn().mockResolvedValue([])
    }),
    setMockResults: (results: any[]) => {
      mockResults = results;
    }
  };
});

vi.mock('./db', () => ({ sql: mockSql }));

describe('normalizeHours helper', () => {
  let consoleSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should return null for null input', () => {
    expect(normalizeHours(null)).toBeNull();
  });

  test('should return null for undefined input', () => {
    expect(normalizeHours(undefined)).toBeNull();
  });

  test('should return null for non-string, non-object input', () => {
    expect(normalizeHours(12345)).toBeNull();
    expect(normalizeHours(true)).toBeNull();
  });

  test('should return null and log error for malformed JSON string', () => {
    const malformed = '{"mon": [{"open": "09:00"}';
    const result = normalizeHours(malformed);
    
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    const loggedError = consoleSpy.mock.calls[0][1];
    expect(loggedError.error).toBeDefined();
    expect(loggedError.rawPreview).toContain('{"mon"');
  });

  test('should return null and log error for JSON with unexpected trailing characters', () => {
    const trailingGarbage = '{"mon":[]}unexpected_chars';
    const result = normalizeHours(trailingGarbage);
    
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain('Failed to parse store_hours JSON');
  });

  test('should parse valid JSON string correctly', () => {
    const validJson = '{"mon":[{"open":"09:00","close":"17:00"}]}';
    const result = normalizeHours(validJson);
    
    expect(result).toEqual({
      mon: [{ open: '09:00', close: '17:00' }]
    });
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('should pass valid object through directly', () => {
    const validObj = {
      tue: [{ open: '10:00', close: '18:00' }]
    };
    const result = normalizeHours(validObj);
    
    expect(result).toEqual(validObj);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

describe('fetchAllPublicStores data query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockResults([]);
  });

  test('should retrieve stores and apply availability state', async () => {
    // Mock store data returned by the single JOIN query
    const mockDbStores = [
      {
        id: 'store-1',
        store_name: 'Amaka Threads',
        store_slug: 'amaka-threads',
        store_description: 'Premium clothing',
        category: 'Fashion',
        location_state: 'Lagos',
        product_count: '5',
        store_timezone: 'Africa/Lagos',
        store_hours: '{"mon":[{"open":"09:00","close":"17:00"}]}',
        accepting_orders: true,
        store_closed_note: null,
        logo_url: 'https://cloudinary/logo.jpg',
        top_products: [
          { name: 'Silk Dress', image_url: 'https://cloudinary/silk.jpg', price: 15000 }
        ]
      }
    ];

    setMockResults(mockDbStores);

    const { fetchAllPublicStores } = await import('./data');
    const results = await fetchAllPublicStores();

    // Verify return structure conforms to PublicStore type
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(expect.objectContaining({
      id: 'store-1',
      store_name: 'Amaka Threads',
      store_slug: 'amaka-threads',
      store_description: 'Premium clothing',
      logo_url: 'https://cloudinary/logo.jpg',
      product_count: 5,
      category: 'Fashion',
      location_state: 'Lagos',
      top_products: [
        { name: 'Silk Dress', image_url: 'https://cloudinary/silk.jpg', price: 15000 }
      ],
      availability: expect.objectContaining({
        state: expect.any(String),
        label: expect.any(String)
      })
    }));
  });

  test('should query database with proper filters and defaults', async () => {
    setMockResults([]);

    const { fetchAllPublicStores } = await import('./data');
    await fetchAllPublicStores('silk', 'Fashion', 'name', 'Lagos', 20);

    // Verify mockSql was called
    expect(mockSql).toHaveBeenCalled();

    // Find the main query call
    const mainCall = mockSql.mock.calls.find(call => {
      const strings = call[0];
      const queryText = strings && strings[0] ? strings[0] : '';
      return queryText.trim().toUpperCase().startsWith('SELECT');
    });
    expect(mainCall).toBeDefined();

    // Find the category filter query call
    const categoryCall = mockSql.mock.calls.find(call => {
      const strings = call[0];
      const queryText = strings && strings[0] ? strings[0] : '';
      return queryText.includes('u.category =');
    });
    expect(categoryCall).toBeDefined();

    // Find the location filter query call
    const locationCall = mockSql.mock.calls.find(call => {
      const strings = call[0];
      const queryText = strings && strings[0] ? strings[0] : '';
      return queryText.includes('u.location_state =');
    });
    expect(locationCall).toBeDefined();

    // Check search filter is in the main query values
    const mainValues = mainCall!.slice(1);
    expect(mainValues.some(arg => typeof arg === 'string' && arg.includes('%silk%'))).toBe(true);

    // Check category filter values
    const categoryValues = categoryCall!.slice(1);
    expect(categoryValues.includes('Fashion')).toBe(true);

    // Check location filter values
    const locationValues = locationCall!.slice(1);
    expect(locationValues.includes('Lagos')).toBe(true);
  });
});
