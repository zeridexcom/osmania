"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Lock, Search, AlertCircle, Loader2 } from "lucide-react";
import { clientGetPublicStudentResult } from "@/lib/data/client";

function generateCaptcha(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function SearchForm() {
  const router = useRouter();
  const [registerNumber, setRegisterNumber] = useState("");
  const [yearPassout, setYearPassout] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaAnim, setCaptchaAnim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorAnim, setErrorAnim] = useState("");
  const [isPending, startTransition] = useTransition();

  function refreshCaptcha() {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaAnim("captcha-flip");
    setTimeout(() => setCaptchaAnim(""), 500);
  }

  function handleReset() {
    setRegisterNumber("");
    setYearPassout("");
    setCaptchaInput("");
    setError(null);
  }

  function setErrorWithShake(msg: string) {
    setError(msg);
    setErrorAnim("captcha-shake");
    setTimeout(() => setErrorAnim(""), 400);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setErrorAnim("");

    const ht = registerNumber.trim();
    if (!/^[A-Z0-9]{6,20}$/i.test(ht)) {
      setErrorWithShake("Hall Ticket/Register Number must be 6-20 alphanumeric characters.");
      return;
    }
    if (!yearPassout) {
      setErrorWithShake("Please select a year of passout.");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setErrorWithShake("CAPTCHA does not match. Please try again.");
      refreshCaptcha();
      return;
    }

    const yearNum = Number(yearPassout);

    startTransition(async () => {
      try {
        const result = await clientGetPublicStudentResult(ht.toUpperCase(), yearNum);
        if (!result) {
          setError("No result found for the given Hall Ticket Number and Year of Passout.");
          refreshCaptcha();
          return;
        }
        router.push(`/result/${ht.toUpperCase()}?examYear=${yearNum}`);
      } catch (err) {
        setErrorWithShake((err as Error).message);
        refreshCaptcha();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Hall Ticket Input */}
      <div className="flex flex-col gap-2.5">
        <label
          className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold"
          htmlFor="registerNumber"
        >
          🎫 Enter Register Number
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant size-5" />
          <input
            className="w-full pl-12 pr-4 py-3.5 border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm transition-all bg-surface-container-lowest shadow-sm text-on-surface placeholder-on-surface-variant/50"
            id="registerNumber"
            name="registerNumber"
            placeholder="e.g. 160123733001"
            required
            type="text"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* Year of Passout Selection */}
      <div className="flex flex-col gap-2.5">
        <label
          className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold"
          htmlFor="yearPassout"
        >
          📅 Year of Passout
        </label>
        <select
          className="w-full px-4 py-3.5 border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm bg-surface-container-lowest transition-all shadow-sm text-on-surface"
          id="yearPassout"
          name="yearPassout"
          required
          value={yearPassout}
          onChange={(e) => setYearPassout(e.target.value)}
        >
          <option value="">Select Year</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
        </select>
      </div>

      {/* CAPTCHA Security Section */}
      <div className="col-span-1 md:col-span-2 flex flex-col gap-2.5 mt-2">
        <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          🔒 Security Verification
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div
            className={`bg-surface-container border border-outline-variant px-6 py-3 rounded-lg font-headline text-2xl tracking-[0.3em] select-none w-48 text-center shrink-0 shadow-inner text-on-surface font-bold cursor-pointer ${captchaAnim} ${errorAnim}`}
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(227, 226, 227, 0.4) 10px, rgba(227, 226, 227, 0.4) 20px)",
            }}
            onClick={refreshCaptcha}
            title="Click to refresh CAPTCHA"
          >
            {captcha || "..."}
          </div>
          <div className="flex-1 flex gap-3">
            <input
              className="flex-1 px-5 py-3.5 border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm uppercase transition-all bg-surface-container-lowest shadow-sm text-on-surface placeholder-on-surface-variant/50"
              placeholder="Enter CAPTCHA"
              required
              maxLength={5}
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
            />
            <button
              type="button"
              onClick={refreshCaptcha}
              className="text-xs uppercase tracking-widest text-primary font-label hover:underline font-bold px-3 py-2 shrink-0 border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className={`col-span-1 md:col-span-2 flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container/40 text-on-error-container border border-error/30 ${errorAnim}`}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <p className="font-body text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Form Actions Section */}
      <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-end gap-4 mt-6 pt-6 border-t border-outline-variant/30">
        <button
          className="px-6 py-3.5 border border-outline text-on-surface font-label uppercase tracking-widest text-xs font-bold rounded-lg hover:bg-surface-container-low transition-colors w-full sm:w-auto"
          type="button"
          onClick={handleReset}
        >
          Clear Form
        </button>
        <button
          className="px-8 py-3.5 bg-primary text-on-primary font-label uppercase tracking-widest text-xs font-bold rounded-lg border border-primary hover:bg-surface-tint hover:shadow-md transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 w-full sm:w-auto shadow-sm disabled:opacity-60"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          <span>Submit Query</span>
        </button>
      </div>
    </form>
  );
}
