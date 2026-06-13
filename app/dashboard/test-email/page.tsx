/**
 * Email Testing Page
 * Quick way to test SMTP configuration
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestEmailPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState(session?.user?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error || 'Failed to send test email' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Test Email Configuration</h1>
        <p className="mt-2 text-sm text-slate-600">
          Send a test email to verify your SMTP setup is working correctly.
        </p>
      </div>

      {/* Test Email Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Recipient Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              A test email will be sent to this address to verify SMTP configuration.
            </p>
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.message}
              </p>
            </div>
          )}

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendTest}
            disabled={!email || isSending}
            className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending Test Email...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                Send Test Email
              </>
            )}
          </button>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">📋 SMTP Configuration</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Host:</strong> {process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp-relay.brevo.com'}
          </p>
          <p>
            <strong>Port:</strong> 587
          </p>
          <p>
            <strong>From:</strong> {process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@vendle.com'}
          </p>
          <p className="mt-4 text-xs text-blue-700">
            💡 <strong>Tip:</strong> Make sure your .env file is configured with valid Brevo SMTP
            credentials. Restart your dev server after updating environment variables.
          </p>
        </div>
      </div>
    </div>
  );
}
