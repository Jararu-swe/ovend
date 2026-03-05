// Minimal browser-safe shim for `stream/consumers` used by dev-only tooling like `nock`.
// This should never actually be called in your app runtime.

export async function arrayBuffer() {
  throw new Error('stream/consumers is not available in this environment.');
}

export default { arrayBuffer };

