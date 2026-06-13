# Implementation Plan: Store Performance and Data Fixes

## Overview

This implementation addresses three interconnected issues: malformed JSON data causing crashes, N+1 query patterns causing 9-10 second page loads, and insufficient error handling. The solution eliminates sequential queries by using SQL JOINs with JSON aggregation, adds defensive try-catch blocks around JSON parsing, creates a data cleanup script with dry-run mode, and adds performance logging to verify improvements.

## Tasks

- [ ] 1. Create data migration script for store_hours cleanup
  - [ ] 1.1 Create `scripts/fix-store-hours-data.js` with dry-run capability
    - Implement query to fetch all users with non-null store_hours
    - Add JSON validation logic to identify malformed entries
    - Implement NULL update logic for invalid entries
    - Add comprehensive logging (total checked, invalid found, fixed count)
    - Support both dry-run mode (reports only) and live mode (applies fixes)
    - Log all errors with store ID, name, and error details
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.5_
  
  - [ ]* 1.2 Write unit tests for migration script
    - Test dry-run mode doesn't modify database
    - Test malformed JSON detection
    - Test NULL assignment for invalid data
    - Test error logging format
    - _Requirements: 6.4_

- [ ] 2. Checkpoint - Review migration script
  - Ensure migration script logic is correct, ask the user to review the dry-run output before proceeding with live execution.

- [ ] 3. Add defensive error handling to store-availability parser
  - [ ] 3.1 Update `normalizeHours()` function in `app/lib/store-availability.ts`
    - Add try-catch block around `JSON.parse()` call (line 76)
    - Return `null` on parse failure instead of throwing
    - Add console.error logging with truncated raw value (first 100 chars)
    - Add null/undefined check before string parsing
    - Maintain existing validation logic after successful parse
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 3.2 Write unit tests for normalizeHours error handling
    - Test null input returns null
    - Test undefined input returns null
    - Test malformed JSON string returns null and logs error
    - Test non-string, non-object input returns null
    - Test valid JSON string parses correctly
    - Test valid object passes through correctly
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Optimize fetchAllPublicStores query to eliminate N+1 pattern
  - [ ] 4.1 Refactor `fetchAllPublicStores()` in `app/lib/data.ts` (lines 796-932)
    - Replace `for...of` loop with single optimized SQL query
    - Add LEFT JOIN to store_theme table for logo_url
    - Use PostgreSQL `json_agg()` with subquery for top 3 products
    - Add `json_build_object()` to construct product JSON array
    - Maintain existing search, category, location, and sort filters
    - Remove individual per-store query error handlers
    - Add single try-catch around entire query
    - Preserve existing `PublicStore[]` return type and structure
    - Call `getStoreAvailability()` for each result in post-processing
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 4.2 Write integration tests for optimized query
    - Test query returns correct data structure
    - Test search filter works correctly
    - Test category filter works correctly
    - Test location filter works correctly
    - Test sort options work correctly
    - Test limit parameter works correctly
    - Test logo_url is fetched correctly
    - Test top_products array has max 3 items
    - Test handles stores with no products
    - Test handles stores with no logo
    - _Requirements: 2.1, 2.2, 2.3, 3.5_

- [ ] 5. Add performance monitoring and logging
  - [ ] 5.1 Add query execution time logging to `fetchAllPublicStores()`
    - Add `console.time('fetchAllPublicStores')` at function start
    - Add `console.timeEnd('fetchAllPublicStores')` before return statements
    - Log total number of stores returned
    - Add performance hint if execution exceeds 500ms threshold
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 5.2 Write unit tests for performance logging
    - Test timing logs are generated
    - Test store count is logged
    - Test performance warning triggers for slow queries
    - _Requirements: 5.1, 5.2_

- [ ] 6. Checkpoint - Verify performance improvements
  - Run the application and load the /explore page
  - Check console for query execution time (should be <500ms)
  - Verify no crashes occur with malformed data
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Add database constraint for store_hours validation (optional)
  - [ ] 7.1 Create database migration to add CHECK constraint
    - Add constraint ensuring store_hours is valid JSONB or NULL
    - Test constraint blocks invalid JSON insertion
    - Document constraint in migration file
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 7.2 Write tests for database constraint
    - Test valid JSON is accepted
    - Test NULL is accepted
    - Test malformed JSON is rejected
    - Test application handles constraint violation gracefully
    - _Requirements: 4.1, 4.2_

- [ ] 8. Final checkpoint - End-to-end verification
  - Run migration script in dry-run mode to verify data issues are identified
  - Run migration script in live mode if dry-run shows issues
  - Verify explore page loads in under 2 seconds with 50 stores
  - Verify no application crashes with current production data
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The migration script (1.1) should be reviewed and tested in dry-run mode before live execution
- The query optimization (4.1) is the most impactful change for performance
- The defensive error handling (3.1) prevents crashes from future data quality issues
- Database constraint (7.1) is marked optional as it requires database migration
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user review
- Performance logging (5.1) provides measurement of optimization effectiveness
- All changes maintain backward compatibility with existing code

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "3.2", "4.1"] },
    { "id": 2, "tasks": ["4.2", "5.1"] },
    { "id": 3, "tasks": ["5.2", "7.1"] },
    { "id": 4, "tasks": ["7.2"] }
  ]
}
```
