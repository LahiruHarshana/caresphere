"use client";

import React, { useState } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripeCardElementOptions } from "@stripe/stripe-js";

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
}

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

export default function CheckoutForm({ clientSecret, onSuccess, onCancel, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (stripeError) {
      setError(stripeError.message || "An unexpected error occurred.");
      setProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      onSuccess();
    } else {
      setError("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg">
        <label className="block text-sm font-semibold text-teal-900 mb-2">
          Card Details
        </label>
        <div className="p-3 bg-white border border-gray-300 rounded-md shadow-sm">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors shadow-md disabled:bg-teal-400 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
      
      <p className="text-center text-xs text-gray-500">
        Secure payment powered by Stripe
      </p>
    </form>
  );
}
