/**
 * Test defensive error handling in normalizeHours function
 * This simulates the TypeScript normalizeHours logic in Node.js
 * 
 * Run with: node scripts/test-error-handling.js
 */

console.log("\n" + "=".repeat(60));
console.log("🛡️  ERROR HANDLING TEST");
console.log("=".repeat(60) + "\n");

// Simulate the normalizeHours function from store-availability.ts
function normalizeHours(raw) {
  if (raw == null || raw === undefined) return null;
  
  let obj = raw;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw);
    } catch (err) {
      // Log error with truncated raw value for debugging
      const rawPreview = String(raw).substring(0, 100);
      console.error('Failed to parse store_hours JSON:', {
        error: err.message,
        rawPreview: rawPreview + (raw.length > 100 ? '...' : '')
      });
      return null;
    }
  }
  
  if (typeof obj !== 'object' || obj === null) return null;
  
  // Simplified validation - just check it's an object with some keys
  return obj;
}

// Test cases
const testCases = [
  {
    name: "Null input",
    input: null,
    expectedResult: null,
    shouldError: false
  },
  {
    name: "Undefined input",
    input: undefined,
    expectedResult: null,
    shouldError: false
  },
  {
    name: "Valid JSON string",
    input: '{"mon":[{"open":"09:00","close":"17:00"}]}',
    expectedResult: { mon: [{ open: "09:00", close: "17:00" }] },
    shouldError: false
  },
  {
    name: "Valid object",
    input: { mon: [{ open: "09:00", close: "17:00" }] },
    expectedResult: { mon: [{ open: "09:00", close: "17:00" }] },
    shouldError: false
  },
  {
    name: "Malformed JSON string",
    input: '{mon:[{open:"09:00",close:"17:00"}]}',
    expectedResult: null,
    shouldError: true
  },
  {
    name: "Invalid JSON with trailing comma",
    input: '{"mon":[{"open":"09:00",}]}',
    expectedResult: null,
    shouldError: true
  },
  {
    name: "Number input",
    input: 12345,
    expectedResult: null,
    shouldError: false
  },
  {
    name: "Empty string",
    input: '',
    expectedResult: null,
    shouldError: true
  },
  {
    name: "Very long malformed JSON",
    input: '{"mon":' + 'x'.repeat(200) + '}',
    expectedResult: null,
    shouldError: true
  }
];

let passedCount = 0;
let failedCount = 0;

testCases.forEach((testCase, idx) => {
  console.log(`Test ${idx + 1}: ${testCase.name}`);
  console.log(`  Input: ${typeof testCase.input === 'string' ? `"${testCase.input.substring(0, 50)}${testCase.input.length > 50 ? '...' : ''}"` : testCase.input}`);
  
  try {
    const result = normalizeHours(testCase.input);
    const passed = result === testCase.expectedResult || JSON.stringify(result) === JSON.stringify(testCase.expectedResult);
    
    if (passed) {
      console.log(`  ✅ PASS: Returned ${result === null ? 'null' : 'valid object'}`);
      passedCount++;
    } else {
      console.log(`  ❌ FAIL: Expected ${testCase.expectedResult}, got ${result}`);
      failedCount++;
    }
  } catch (error) {
    if (testCase.shouldError) {
      console.log(`  ✅ PASS: Caught error as expected: ${error.message}`);
      passedCount++;
    } else {
      console.log(`  ❌ FAIL: Unexpected error: ${error.message}`);
      failedCount++;
    }
  }
  
  console.log("");
});

console.log("=".repeat(60));
console.log("📊 SUMMARY");
console.log("=".repeat(60));
console.log(`Total tests:  ${testCases.length}`);
console.log(`Passed:       ${passedCount} ✅`);
console.log(`Failed:       ${failedCount} ❌`);
console.log(`Success rate: ${Math.round((passedCount / testCases.length) * 100)}%`);
console.log("=".repeat(60) + "\n");

if (failedCount === 0) {
  console.log("🎉 All error handling tests passed!\n");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Review the errors above.\n");
  process.exit(1);
}
