// Global singleton nonce storage that survives hot-reloads
// Uses Node.js global object to persist across module reloads

interface GlobalWithNonces {
  __nonceStore?: Map<string, string>;
}

const globalWithNonces = global as GlobalWithNonces;

// Initialize once and reuse across reloads
if (!globalWithNonces.__nonceStore) {
  console.log('🔧 [NONCE_STORE] Initializing NEW nonce storage');
  globalWithNonces.__nonceStore = new Map<string, string>();
} else {
  console.log('🔄 [NONCE_STORE] Reusing EXISTING nonce storage');
}

const nonces = globalWithNonces.__nonceStore;

export function setNonce(address: string, nonce: string): void {
  const key = address.toLowerCase();
  nonces.set(key, nonce);
  console.log(`💾 [NONCE_STORE] Stored nonce for ${key}: ${nonce.substring(0, 10)}...`);
  console.log(`📊 [NONCE_STORE] Total nonces in store: ${nonces.size}`);
}

export function getNonce(address: string): string | undefined {
  const key = address.toLowerCase();
  const nonce = nonces.get(key);
  console.log(`🔍 [NONCE_STORE] Looking up ${key}: ${nonce ? 'FOUND' : 'NOT FOUND'}`);
  return nonce;
}

export function deleteNonce(address: string): void {
  const key = address.toLowerCase();
  nonces.delete(key);
  console.log(`🗑️ [NONCE_STORE] Deleted nonce for ${key}`);
  console.log(`📊 [NONCE_STORE] Total nonces remaining: ${nonces.size}`);
}
