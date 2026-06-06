// app/auth/signin/page.tsx
// Custom auth screen with Google and email/password/OTP flows.

"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type AuthFlow = "login" | "signup";
type Step = "details" | "otp";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/colleges";

  const [flow, setFlow] = useState<AuthFlow>("login");
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  function handleGoogleSignIn() {
    setGooglePending(true);
    signIn("google", { callbackUrl }, { prompt: "select_account" });
  }

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow,
          name: flow === "signup" ? name : undefined,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send OTP");

      setStep("otp");
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setPending(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const result = await signIn("email-password", {
      redirect: false,
      flow,
      name,
      email,
      password,
      otp,
      callbackUrl,
    });

    setPending(false);

    if (result?.error) {
      toast.error("Invalid or expired OTP");
      return;
    }

    toast.success(flow === "signup" ? "Account created" : "Signed in");
    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  function switchFlow(nextFlow: AuthFlow) {
    setFlow(nextFlow);
    setStep("details");
    setOtp("");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-4 py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-gray-950 p-8 text-white lg:p-10">
          <p className="text-sm font-bold uppercase text-brand-200">CollegeFinder account</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">
            Sign in securely before exploring colleges.
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-300">
            Use Google, or create an email account with password plus OTP verification. Your saved colleges and comparisons stay tied to your account.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-gray-200">
            {["Email OTP verification", "Saved colleges", "Saved comparisons"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-xs font-black">OK</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchFlow(item)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-bold transition",
                  flow === item ? "bg-white text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-800"
                )}
              >
                {item === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googlePending}
            className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-800 transition hover:bg-gray-50"
          >
            <span className="text-lg">G</span>
            {googlePending ? "Opening Google..." : "Continue with Google"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-bold uppercase text-gray-400">or use email</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {step === "details" ? (
            <form onSubmit={requestOtp} className="space-y-4">
              {flow === "signup" && (
                <label className="block">
                  <span className="text-sm font-bold text-gray-700">Name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="input-base mt-2 h-12"
                    placeholder="Your name"
                    required
                  />
                </label>
              )}
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input-base mt-2 h-12"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-base mt-2 h-12"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </label>
              <Button type="submit" loading={pending} className="w-full justify-center" size="lg">
                Send OTP to email
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
                We sent a 6-digit OTP to <span className="font-bold">{email}</span>.
              </div>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Email OTP</span>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="input-base mt-2 h-12 text-center text-xl font-black tracking-[0.3em]"
                  placeholder="000000"
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  required
                />
              </label>
              <Button type="submit" loading={pending} className="w-full justify-center" size="lg">
                Verify and continue
              </Button>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full text-sm font-bold text-gray-500 hover:text-brand-700"
              >
                Change email or password
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
