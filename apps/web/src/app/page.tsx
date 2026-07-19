"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/utils/supabase";
import { hashPassword } from "@/utils/hash";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, AlertTriangle, Eye, EyeOff, SkipForward, MailCheck, KeyRound, ShieldCheck } from "lucide-react";
import disposableDomains from 'disposable-email-domains';

type PageMode = 'login' | 'signup' | 'otp' | 'forgot' | 'reset-otp' | 'reset-password';

export default function Home() {
  const router = useRouter();
  const { 
    isLoggedIn, registeredEmail, passkey, setRole, setUsername, 
    setRegisteredEmail, setIsLoggedIn, setPasskey, wipeDevice, 
    setGoogleClientId, setGeminiApiKey, setIsVerified
  } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<PageMode>('signup');
  const [usernameInput, setUsernameInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [emailDelivered, setEmailDelivered] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (useAuthStore.getState().isLoggedIn) {
      router.push("/dashboard");
    }
  }, [router]);

  if (!mounted) return null;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPasswordHash = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH;
  const adminGoogleClientId = process.env.NEXT_PUBLIC_ADMIN_GOOGLE_CLIENT_ID;

  const switchMode = (m: PageMode) => {
    setMode(m);
    setError("");
    setOtpInput("");
  };

  // --- MAIN SIGN UP / LOG IN SUBMIT ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === 'signup' && !usernameInput.trim()) {
      setError("Please provide a username for signup.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const hashedPassword = await hashPassword(password);

    // ADMIN CHECK
    if (email === adminEmail) {
      if (hashedPassword === adminPasswordHash) {
        setUsername("krxpriyanshu");
        setRole('admin');
        setRegisteredEmail(email);
        setPasskey(hashedPassword);
        setIsVerified(true);
        if (adminGoogleClientId) setGoogleClientId(adminGoogleClientId);
        if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) setGeminiApiKey(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
        setIsLoggedIn(true);
        router.push("/dashboard");
        return;
      } else {
        setError("Invalid Admin Credentials");
        setIsSubmitting(false);
        return;
      }
    }

    // DEVICE CONFLICT CHECK
    if (registeredEmail && email !== registeredEmail) {
      setConflict(true);
      setIsSubmitting(false);
      return;
    }

    // SIGNUP LOGIC
    if (mode === 'signup') {
      const domain = email.split('@')[1];
      if (domain && disposableDomains.includes(domain.toLowerCase())) {
        setError("Please use a permanent email address. Temporary emails are not allowed.");
        setIsSubmitting(false);
        return;
      }

      try {
        const { error: dbError } = await supabase
          .from('guest_users')
          .insert([{ 
            username: usernameInput.trim(), 
            email: email.trim(),
            password_hash: hashedPassword,
            sync_fallback: btoa(unescape(encodeURIComponent(password))),
            role: 'guest',
            is_verified: false
          }]);
          
        if (dbError) {
          if (dbError.code === '23505') {
            setError("An account with this email already exists. Please log in.");
            setIsSubmitting(false);
            return;
          }
          console.error("Supabase Insert Error:", dbError);
        }

        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        });
        
        // If the API itself crashed (5xx), that's a real error — stop.
        // But if it succeeded even with emailDelivered=false, proceed to OTP screen.
        if (!res.ok) throw new Error("Failed to generate OTP");

        const result = await res.json();
        setEmailDelivered(result.emailDelivered ?? true);
        setMode('otp');
        setIsSubmitting(false);
      } catch (err) {
        console.error(err);
        setError("Failed to start verification. Please try again.");
        setIsSubmitting(false);
      }
      return;
    }

    // LOGIN LOGIC
    if (mode === 'login') {
      try {
        const { data: user } = await supabase
          .from('guest_users')
          .select('username, email, password_hash, role, google_client_id, gemini_api_key, is_verified')
          .eq('email', email.trim())
          .single();

        if (user) {
          if (hashedPassword === user.password_hash) {
            setRegisteredEmail(user.email);
            setPasskey(user.password_hash);
            setUsername(user.username);
            setRole(user.role || 'guest');
            setIsVerified(!!user.is_verified);
            if (user.google_client_id) setGoogleClientId(user.google_client_id);
            if (user.gemini_api_key) setGeminiApiKey(user.gemini_api_key);
            setIsLoggedIn(true);
            
            if (!user.google_client_id && !user.gemini_api_key && user.role !== 'admin') {
              setTimeout(() => router.push("/onboarding"), 0);
            } else {
              setTimeout(() => router.push("/dashboard"), 0);
            }
            return;
          } else {
            setError("Incorrect password");
            setIsSubmitting(false);
            return;
          }
        }
      } catch (e) {
        console.error("Cloud login failed, checking local storage...");
      }

      // LOCAL FALLBACK
      if (email === registeredEmail) {
        if (hashedPassword === passkey) {
          setIsLoggedIn(true);
          router.push("/dashboard");
        } else {
          setError("Incorrect password");
          setIsSubmitting(false);
        }
        return;
      }
      
      setError("Account not found. Please sign up.");
      setIsSubmitting(false);
    }
  };

  // --- OTP VERIFY (SIGNUP) ---
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) { setError("Please enter the 6-digit code."); return; }
    setIsSubmitting(true);
    setError("");

    try {
      const { data: user } = await supabase
        .from('guest_users')
        .select('otp_code, password_hash')
        .eq('email', email.trim())
        .single();

      if (user && user.otp_code === otpInput.trim()) {
        await supabase
          .from('guest_users')
          .update({ is_verified: true, otp_code: null })
          .eq('email', email.trim());

        finishSignup(true, user.password_hash);
      } else {
        setError("Incorrect or expired code. Check your email again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Failed to verify code.");
      setIsSubmitting(false);
    }
  };

  const handleSkipOtp = async () => {
    setIsSubmitting(true);
    try {
      const { data: user } = await supabase
        .from('guest_users')
        .select('password_hash')
        .eq('email', email.trim())
        .single();
      if (user) finishSignup(false, user.password_hash);
    } catch { setIsSubmitting(false); }
  };

  const finishSignup = (verified: boolean, hash: string) => {
    setRegisteredEmail(email.trim());
    setPasskey(hash);
    setUsername(usernameInput.trim());
    setRole('guest');
    setIsVerified(verified);
    setIsLoggedIn(true);
    setTimeout(() => router.push("/onboarding"), 0);
  };

  // --- FORGOT PASSWORD ---
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setIsSubmitting(true);
    setError("");

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      // Always proceed to OTP screen (to prevent user enumeration)
      setMode('reset-otp');
      setOtpInput("");
      setIsSubmitting(false);
    } catch {
      setError("Failed to send reset email. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- RESET OTP VERIFY ---
  const handleResetOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length < 6) { setError("Please enter the 6-digit code."); return; }
    setIsSubmitting(true);
    setError("");

    try {
      const { data: user } = await supabase
        .from('guest_users')
        .select('otp_code')
        .eq('email', email.trim())
        .single();

      if (user && user.otp_code === otpInput.trim()) {
        setMode('reset-password');
        setIsSubmitting(false);
      } else {
        setError("Incorrect or expired code.");
        setIsSubmitting(false);
      }
    } catch {
      setError("Failed to verify code.");
      setIsSubmitting(false);
    }
  };

  // --- SET NEW PASSWORD ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) { setError("Please enter a new password."); return; }
    if (newPassword !== confirmNewPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setIsSubmitting(true);
    setError("");

    try {
      const newHash = await hashPassword(newPassword);
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otpInput, 
          newPasswordHash: newHash, 
          sfk: btoa(unescape(encodeURIComponent(newPassword))) 
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        setIsSubmitting(false);
        return;
      }

      // Update local state and log in
      setRegisteredEmail(email.trim());
      setPasskey(newHash);
      setIsVerified(true);
      setIsLoggedIn(true);
      setTimeout(() => router.push("/dashboard"), 0);
    } catch {
      setError("Failed to reset password. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- WIPE DEVICE ---
  const handleWipe = async () => {
    const hashedPassword = await hashPassword(password);
    wipeDevice();
    setRegisteredEmail(email);
    setPasskey(hashedPassword);
    setUsername(email.split("@")[0] || "Guest");
    setRole('guest');
    setIsLoggedIn(true);
    router.push("/onboarding");
  };

  const pageTitle = {
    login: 'DhyanLok', signup: 'DhyanLok',
    otp: 'Verify Email', forgot: 'Forgot Password',
    'reset-otp': 'Check Your Email', 'reset-password': 'New Password'
  }[mode];

  const pageSubtitle = {
    login: 'Welcome back to your personal sanctuary. Step in to resume your focus.',
    signup: 'Begin your journey toward mindfulness, clarity, and daily mastery.',
    otp: emailDelivered
      ? 'We sent a 6-digit code to your email.'
      : 'Check your spam, or skip verification below.',
    forgot: 'Enter your email and we\'ll send you a reset code.',
    'reset-otp': `We sent a 6-digit code to ${email}.`,
    'reset-password': 'Choose a strong password for your account.'
  }[mode];

  const pageIcon = {
    login: <Sparkles className="text-[var(--theme-accent)]" size={32} />,
    signup: <Sparkles className="text-[var(--theme-accent)]" size={32} />,
    otp: <MailCheck className={emailDelivered ? 'text-emerald-400' : 'text-amber-400'} size={32} />,
    forgot: <KeyRound className="text-amber-400" size={32} />,
    'reset-otp': <MailCheck className="text-amber-400" size={32} />,
    'reset-password': <ShieldCheck className="text-emerald-400" size={32} />
  }[mode];

  return (
    <div className="fixed inset-0 overflow-y-auto min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 z-[9999] bg-[var(--theme-bg)]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center relative z-10"
      >
        <div className="h-20 w-20 rounded-2xl bg-premium-panel border border-premium-border shadow-2xl flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform">
          {pageIcon}
        </div>
        
        <h1 className="text-3xl font-heading font-medium tracking-tight mb-2 text-center">{pageTitle}</h1>
        <p className="text-premium-muted text-sm text-center font-sans max-w-sm mb-8">{pageSubtitle}</p>

        <AnimatePresence mode="wait">
          {conflict ? (
            <motion.div key="conflict" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col gap-4 text-center">
              <div className="flex justify-center mb-2"><AlertTriangle size={32} className="text-red-500" /></div>
              <p className="text-sm">This device is currently registered to <br/><span className="font-bold text-premium-text">{registeredEmail}</span></p>
              <p className="text-xs text-premium-muted mb-4">If you log in with a new email, all locally saved API keys and settings will be permanently wiped from this browser.</p>
              <button onClick={() => { setConflict(false); setEmail(registeredEmail || ""); setPassword(""); }} className="w-full py-3 rounded-xl border border-premium-border hover:bg-premium-panel transition-colors">
                Cancel & Log in with {registeredEmail}
              </button>
              <button onClick={handleWipe} className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors">
                Wipe Device & Start Fresh
              </button>
            </motion.div>

          ) : mode === 'otp' ? (
            <motion.form key="otp" onSubmit={handleOtpSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col gap-6">
              <input type="text" autoFocus maxLength={6} placeholder="000000" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-transparent border-b border-premium-border text-center text-4xl pb-4 outline-none focus:border-premium-text transition-colors tracking-widest font-mono" />
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div className="flex flex-col gap-3 mt-2">
                <button type="submit" disabled={isSubmitting || otpInput.length < 6}
                  className="w-full py-4 rounded-xl bg-premium-text text-[var(--theme-bg)] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40">
                  {isSubmitting ? "Verifying..." : "Verify & Enter"} <ArrowRight size={18} />
                </button>
                <button type="button" onClick={handleSkipOtp} disabled={isSubmitting}
                  className="w-full py-3 rounded-xl border border-premium-border text-premium-muted hover:text-premium-text transition-colors flex items-center justify-center gap-2 text-sm">
                  Skip for now <SkipForward size={14} />
                </button>
                <p className="text-[10px] text-premium-muted text-center leading-relaxed">Unverified accounts are automatically wiped after 30 days.</p>
              </div>
            </motion.form>

          ) : mode === 'forgot' ? (
            <motion.form key="forgot" onSubmit={handleForgotSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col gap-6">
              <input type="email" autoFocus placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-premium-border text-center text-lg pb-3 outline-none focus:border-premium-text transition-colors" />
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div className="flex flex-col gap-3 mt-2">
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-premium-text text-[var(--theme-bg)] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isSubmitting ? "Sending..." : "Send Reset Code"} <ArrowRight size={18} />
                </button>
                <button type="button" onClick={() => switchMode('login')}
                  className="w-full py-3 text-sm text-premium-muted hover:text-premium-text transition-colors">
                  Back to Log In
                </button>
              </div>
            </motion.form>

          ) : mode === 'reset-otp' ? (
            <motion.form key="reset-otp" onSubmit={handleResetOtpSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col gap-6">
              <input type="text" autoFocus maxLength={6} placeholder="000000" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-transparent border-b border-premium-border text-center text-4xl pb-4 outline-none focus:border-premium-text transition-colors tracking-widest font-mono" />
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div className="flex flex-col gap-3 mt-2">
                <button type="submit" disabled={isSubmitting || otpInput.length < 6}
                  className="w-full py-4 rounded-xl bg-premium-text text-[var(--theme-bg)] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40">
                  {isSubmitting ? "Verifying..." : "Verify Code"} <ArrowRight size={18} />
                </button>
                <button type="button" onClick={() => switchMode('forgot')}
                  className="w-full py-3 text-sm text-premium-muted hover:text-premium-text transition-colors">
                  Resend code
                </button>
              </div>
            </motion.form>

          ) : mode === 'reset-password' ? (
            <motion.form key="reset-password" onSubmit={handleResetPasswordSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <input type={showNewPassword ? "text" : "password"} autoFocus placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-premium-border text-center text-lg pb-3 outline-none focus:border-premium-text transition-colors tracking-widest placeholder:tracking-normal px-8" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-0 top-1 text-premium-muted hover:text-premium-text transition-colors">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input type="password" placeholder="Confirm new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-premium-border text-center text-lg pb-3 outline-none focus:border-premium-text transition-colors tracking-widest placeholder:tracking-normal" />
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 mt-2 rounded-xl bg-premium-text text-[var(--theme-bg)] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Set New Password"} <ShieldCheck size={18} />
              </button>
            </motion.form>

          ) : (
            <motion.form key="auth" onSubmit={handleAuthSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full flex flex-col gap-6">
              <div className="flex bg-premium-border/30 rounded-lg p-1 mb-2">
                <div role="button" tabIndex={0} onClick={() => switchMode('signup')} onKeyDown={(e) => { if(e.key === 'Enter') switchMode('signup'); }}
                  className={`flex-1 text-center py-2 text-sm rounded-md transition-colors cursor-pointer ${mode === 'signup' ? 'bg-premium-text text-[var(--theme-bg)] font-medium' : 'text-premium-muted hover:text-premium-text'}`}>
                  Sign Up
                </div>
                <div role="button" tabIndex={0} onClick={() => switchMode('login')} onKeyDown={(e) => { if(e.key === 'Enter') switchMode('login'); }}
                  className={`flex-1 text-center py-2 text-sm rounded-md transition-colors cursor-pointer ${mode === 'login' ? 'bg-premium-text text-[var(--theme-bg)] font-medium' : 'text-premium-muted hover:text-premium-text'}`}>
                  Log In
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {mode === 'signup' && (
                  <input type="text" autoFocus placeholder="Username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-transparent border-b border-premium-border text-center text-lg pb-3 outline-none focus:border-premium-text transition-colors" />
                )}
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-premium-border text-center text-lg pb-3 outline-none focus:border-premium-text transition-colors" />
                <div className="relative w-full">
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-premium-border text-center text-lg pb-3 outline-none focus:border-premium-text transition-colors tracking-widest placeholder:tracking-normal px-8" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1 text-premium-muted hover:text-premium-text transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <div className="flex flex-col gap-3">
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-premium-text text-[var(--theme-bg)] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isSubmitting ? "Opening Realm..." : (mode === 'signup' ? "Begin Your Journey" : "Enter Your Realm")} <ArrowRight size={18} />
                </button>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('forgot')}
                    className="w-full py-2 text-xs text-premium-muted hover:text-premium-text transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
