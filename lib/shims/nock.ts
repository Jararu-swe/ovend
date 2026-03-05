// Minimal browser-safe shim for `nock`, which is only needed for Node-side tests.
// In the browser / Next.js app runtime we never actually call into it.

function notAvailable() {
  throw new Error('nock is not available in this environment.');
}

const nock = Object.assign(notAvailable, {
  // Commonly used APIs are stubbed to throw if somehow called.
  intercept: notAvailable,
  cleanAll: notAvailable,
});

export default nock;

