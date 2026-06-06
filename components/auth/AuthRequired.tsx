"use client";

import Link from "next/link";

export function AuthRequired({
  title = "Sign in to view colleges",
  description = "Create an account or sign in to browse college details, compare options, and save your shortlist.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-16">
      <div className="card w-full p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4" />
          </svg>
        </div>
        <h1 className="mt-5 text-3xl font-display font-bold text-gray-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">{description}</p>
        <Link href="/auth/signin" className="btn-primary mt-6 justify-center">
          Sign in or sign up
        </Link>
      </div>
    </div>
  );
}
