// app/auth/error/page.tsx
// Friendly auth error screen for failed OAuth or credentials attempts.

import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-16">
      <div className="card w-full p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-red-50 text-red-500">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.3 4.3 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-display font-bold text-gray-950">Authentication failed</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
          The sign-in attempt could not be completed. Try again with Google or email OTP.
        </p>
        <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4 text-left text-sm text-gray-600">
          <p className="font-bold text-gray-900">For Google sign-in:</p>
          <p className="mt-2">Clear site data for localhost, then try again.</p>
          <p className="mt-2">Google redirect URI must be exactly:</p>
          <code className="mt-2 block break-all rounded bg-white p-2 text-xs text-gray-800">
            http://localhost:3000/api/auth/callback/google
          </code>
        </div>
        <Link href="/auth/signin" className="btn-primary mt-6 justify-center">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
