"use client";
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { api } from '@/lib/api';

// 🔑 REPLACE WITH YOUR PUBLIC KEY (starts with pk_test_...)
const stripePromise = loadStripe("pk_test_51SRhSaAroKDmR3CsssqIkKuYf7Dlkfdxnz0mEbAbQKlAzw9wY8YBDTRv3ipgrv6WKfhi94qA5Io4sRK9rqDNPDMU00DSeeHCYL");

export function CheckoutForm({ priceId, onClose }: { priceId: string, onClose: () => void }) {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!priceId) return;

    // Create the session on your backend
    api.post("/api/payment/create-checkout-session", { priceId })
      .then((res) => {
        setClientSecret(res.clientSecret);
      })
      .catch((err) => {
        console.error("Billing Error", err);
        setError("Could not initiate payment. Please try again.");
      });
  }, [priceId]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700">Secure Checkout</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-white p-2">
          {error ? (
             <div className="p-10 text-center text-red-500">{error}</div>
          ) : clientSecret ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout className="h-full min-h-[500px]" />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p>Connecting to Stripe...</p>
                </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}