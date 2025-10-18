'use client';

import { useEffect, useState, useRef } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any;
  }
}

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fallback-project-id';

// Warn if WalletConnect project ID is missing
if (typeof window !== 'undefined' && projectId === 'fallback-project-id') {
  console.warn('⚠️ WalletConnect project ID not found. WalletConnect features will be disabled.');
}

// Only create config on client side to avoid SSR issues
const config = typeof window !== 'undefined' ? createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    ...(projectId !== 'fallback-project-id' ? [walletConnect({
      projectId,
      showQrModal: true,
    })] : []),
  ],
  transports: { [mainnet.id]: http() },
}) : null;

// Module-level auth guards (persist across React Strict Mode double-renders)
let isAuthInFlight = false;
let authRunId = 0;
let lastAuthenticatedAddress: string | null = null;

function EVMInner({ onAddress }: { onAddress: (addr: string) => void }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!address) return;
    if (address === lastAuthenticatedAddress) {
      console.log("⏭️ [SIWE] Already authenticated this address");
      return;
    }
    if (isAuthInFlight) {
      console.log("⏭️ [SIWE] Skipping; auth already in progress");
      return;
    }

    isAuthInFlight = true;
    const runId = ++authRunId;

    (async () => {
      try {
        console.log("🔐 [SIWE] Starting authentication for", address);
        setIsAuthenticating(true);

        // 1) Get nonce (tie to address) — include credentials
        console.log(`📤 [SIWE] Fetching nonce for ${address}`);
        console.log(`📤 [SIWE] POST /api/auth/nonce with body:`, { address });
        
        const r = await fetch("/api/auth/nonce", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
          credentials: "include",
        });
        
        console.log(`📥 [SIWE] Nonce response status: ${r.status}`);
        
        if (!r.ok) {
          throw new Error('Failed to get nonce');
        }
        
        const { nonce } = await r.json();
        if (runId !== authRunId) {
          console.log("⏭️ [SIWE] Stale nonce response, aborting");
          return;
        }

        console.log("✅ [SIWE] Received nonce:", nonce.slice(0, 10) + "...");

        // 2) Sign *exactly* this message
        const message = `Login nonce: ${nonce}`;
        console.log("📝 [SIWE] Requesting signature from wallet...");
        
        let signature: string;
        
        // Always use window.ethereum for signing to avoid wagmi connector issues
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            signature = await window.ethereum.request({
              method: 'personal_sign',
              params: [message, address],
            });
          } catch (err: any) {
            console.error('❌ [SIWE] Signature failed:', err);
            throw err;
          }
        } else {
          throw new Error('No wallet provider found');
        }
        
        if (runId !== authRunId) {
          console.log("⏭️ [SIWE] Stale signature response, aborting");
          return;
        }

        console.log("✅ [SIWE] Signature received:", signature.slice(0, 10) + "...");

        // 3) Verify
        const v = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, nonce, signature }),
          credentials: "include",
        });

        if (!v.ok) {
          const err = await v.json().catch(() => ({}));
          console.error("❌ [SIWE] Verification failed:", err);
          return;
        }

        console.log("🎉 [SIWE] Auth verified");
        lastAuthenticatedAddress = address; // Mark as authenticated
        onAddress(address);
        
      } catch (e: any) {
        console.error("❌ [SIWE] Unexpected error:", e?.message || e);
        
        // Fallback: allow connection without signature for now
        if (e?.message?.includes('rejected') || e?.code === 4001) {
          console.log('🚫 [SIWE] User rejected signature, disconnecting');
          disconnect();
        } else {
          console.warn('⚠️ [SIWE] Error during auth, allowing connection anyway');
          lastAuthenticatedAddress = address; // Mark as authenticated (fallback)
          onAddress(address);
        }
      } finally {
        isAuthInFlight = false;
        setIsAuthenticating(false);
      }
    })();
  }, [address]);

  useEffect(() => {
    if (error) {
      console.error('Wallet connection error:', error);
      if (error.message.includes('rejected') || error.message.includes('denied')) {
        // User rejected - don't show error
      } else if (error.message.includes('reset') || error.message.includes('Connection request reset')) {
        // WalletConnect connection reset - expected when user closes modal
      } else if (error.message.includes('Project ID')) {
        alert('WalletConnect error: Invalid Project ID.\n\nPlease check NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local');
      } else if (error.message.includes('Provider not found')) {
        // Don't show console warnings for missing providers - this is expected
      } else if (error.message.includes('scheme does not have a registered handler')) {
        // WalletConnect deep link error - expected when no wallet app is installed on desktop
      } else {
        console.warn('Connection error:', error.message);
      }
    }
  }, [error]);

  const injectedConnector = connectors.find(c => c.id === 'injected');
  const walletConnectConnector = connectors.find(c => c.id.includes('walletConnect'));

  return (
    <div className="flex gap-1 sm:gap-2 md:gap-3 items-center">
      {isAuthenticating ? (
        <div className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg font-medium text-xs sm:text-sm flex items-center space-x-2">
          <div className="animate-spin w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
          <span className="hidden sm:inline">Signing in...</span>
          <span className="sm:hidden">Signing...</span>
        </div>
      ) : isConnected ? (
        <button 
          className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm"
          onClick={async () => {
            // Clear session cookie by calling logout endpoint
            await fetch('/api/auth/logout', { 
              method: 'POST',
              credentials: 'include'
            }).catch(err => console.error('Logout error:', err));
            
            // Disconnect wallet
            disconnect();
            
            // Reset module-level auth flags
            isAuthInFlight = false;
            authRunId = 0;
            lastAuthenticatedAddress = null;
            
            console.log('👋 [SIWE] Logged out and disconnected');
          }}
        >
          <span className="hidden sm:inline">Disconnect EVM</span>
          <span className="sm:hidden">Disconnect</span>
        </button>
      ) : (
        <>
          <button
            className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
              !injectedConnector 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105'
            }`}
            onClick={() => {
              if (injectedConnector) connect({ connector: injectedConnector });
            }}
            disabled={!injectedConnector}
            title={!injectedConnector ? 'Install MetaMask or another browser wallet to use this option' : 'Connect with MetaMask or browser wallet'}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full"></div>
              <span className="hidden sm:inline">Injected</span>
              <span className="sm:hidden">Meta</span>
            </div>
          </button>
          <button
            className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
              !walletConnectConnector 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105'
            }`}
            onClick={() => {
              if (walletConnectConnector) connect({ connector: walletConnectConnector });
            }}
            disabled={!walletConnectConnector}
            title={!walletConnectConnector ? 'WalletConnect not available' : 'WalletConnect - Scan QR with mobile wallet (Trust Wallet, MetaMask Mobile, etc.)'}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full"></div>
              <span className="hidden sm:inline">WalletConnect</span>
              <span className="sm:hidden">WC</span>
            </div>
          </button>
        </>
      )}
    </div>
  );
}

function EVMConnector({ onAddress }: { onAddress: (addr: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !config) {
    return null; // Return null to match SSR output
  }
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <EVMInner onAddress={onAddress} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function AddressConnector({ onAddress }: { onAddress: (addr: string) => void }) {
  const [xrplAddr, setXrplAddr] = useState<string | null>(null);
  const [xummPending, setXummPending] = useState(false);
  const [xummQR, setXummQR] = useState<string | null>(null);
  const [xummDeeplink, setXummDeeplink] = useState<string | null>(null);

  async function xummConnect() {
    setXummPending(true);
    try {
      const r = await fetch('/api/xumm/create', { method: 'POST' });
      
      // Handle non-JSON responses (like HTML error pages)
      const contentType = r.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('XUMM API returned non-JSON response');
        alert('Xaman wallet is not configured on this server.\n\nTo enable it, set XUMM_API_KEY and XUMM_API_SECRET environment variables.');
        setXummPending(false);
        return;
      }
      
      const j = await r.json();

      if (!r.ok || (!j.deeplink && !j.qr_png)) {
        console.error('XUMM API error:', j);
        alert(`Xaman wallet is not configured.\n\n${j.error || 'Missing XUMM_API_KEY and XUMM_API_SECRET'}`);
        setXummPending(false);
        return;
      }

      // Always show QR code for desktop
      // For mobile, user can click the deeplink button we'll provide
      if (j.qr_png) {
        setXummQR(j.qr_png);
        setXummDeeplink(j.deeplink); // Store deeplink for mobile button
      } else if (j.deeplink) {
        // Fallback: if no QR, open deeplink
        window.open(j.deeplink, '_blank');
      }
      
      // Poll for completion
      if (j.uuid) {
        pollXummStatus(j.uuid);
      }
    } catch (e) {
      console.error('XUMM connection error:', e);
      alert('Failed to connect with Xaman. Please check console for details.');
      setXummPending(false);
    }
  }

  async function pollXummStatus(uuid: string) {
    const maxAttempts = 60; // 5 minutes (5s intervals)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setXummPending(false);
        setXummQR(null);
        return;
      }

      try {
        const r = await fetch(`/api/xumm/status?uuid=${uuid}`);
        const j = await r.json();

        if (j.signed && j.address) {
          // Successfully signed
          setXrplAddr(j.address);
          onAddress(j.address);
          setXummPending(false);
          setXummQR(null);
          setXummDeeplink(null);
          return;
        } else if (j.rejected) {
          // User rejected
          setXummPending(false);
          setXummQR(null);
          setXummDeeplink(null);
          return;
        }

        // Still pending, continue polling
        attempts++;
        setTimeout(poll, 5000);
      } catch (e) {
        console.error('Poll error:', e);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const xrpl = url.searchParams.get('xrpl');
    if (xrpl) {
      setXrplAddr(xrpl);
      onAddress(xrpl);
    }
  }, [onAddress]);

      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-1 sm:gap-2 md:gap-3 items-center">
            <EVMConnector onAddress={onAddress} />
            <button 
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                xummPending || xrplAddr
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg hover:scale-105'
              }`}
              onClick={xummConnect}
              disabled={xummPending || !!xrplAddr}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full"></div>
                <span className="hidden sm:inline">{xummPending ? 'Waiting for Xaman...' : 'Xaman (XRPL)'}</span>
                <span className="sm:hidden">{xummPending ? 'Waiting...' : 'Xa'}</span>
              </div>
            </button>
            {xrplAddr && (
              <button
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm"
                onClick={async () => {
                  // Clear session cookie
                  await fetch('/api/auth/logout', { 
                    method: 'POST',
                    credentials: 'include'
                  }).catch(err => console.error('Logout error:', err));
                  
                  // Clear XRPL address
                  setXrplAddr(null);
                  setXummQR(null);
                  setXummPending(false);
                  
                  console.log('👋 [XRPL] Logged out and disconnected');
                }}
              >
                <span className="hidden sm:inline">Disconnect XRPL</span>
                <span className="sm:hidden">Disconnect</span>
              </button>
            )}
          </div>
      
      {/* QR Code Display */}
      {xummQR && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 max-w-sm mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Connect with Xaman</h3>
            <p className="text-sm text-gray-600">Scan QR code with your Xaman app</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-gray-200 mb-4">
            <img 
              src={xummQR} 
              alt="Xaman QR Code" 
              className="w-full max-w-xs mx-auto rounded-lg"
              crossOrigin="anonymous"
            />
          </div>
          
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>{xummPending ? 'Waiting for you to sign in...' : 'Ready to scan'}</span>
            </div>
          </div>
          
          {/* Mobile: Open in App button */}
          {xummDeeplink && (
            <a
              href={xummDeeplink}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-3 px-4 py-2 text-sm text-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              📱 Open in Xaman App
            </a>
          )}
          
          <button
            onClick={() => {
              setXummQR(null);
              setXummDeeplink(null);
              setXummPending(false);
            }}
            className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
