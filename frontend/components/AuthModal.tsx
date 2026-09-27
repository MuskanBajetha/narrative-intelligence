"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
  setError("");

  console.log("Signup debug:", {
    email,
    name,
    password,
    passwordLength: password.length,
    passwordBytes: new TextEncoder().encode(password).length,
  });

  if (mode === "signup") {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/signup`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const data = await res.json();

        if (Array.isArray(data.detail)) {
            setError(data.detail[0].msg);
        } else {
            setError(data.detail || "Signup failed");
        }

        return;
        }

    }
    const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        });

    if (result?.error) {
        setError("Invalid email or password");
    } else {
        onClose();
        router.push("/dashboard");
    }

  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm p-8 rounded-sm"
        style={{ backgroundColor: "var(--parchment)" }}
      >
        <h3 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--ink)" }}>
          {mode === "login" ? "Sign in" : "Create account"}
        </h3>

        <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full py-2.5 rounded-full border mb-4 text-sm"
            style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
            >
            Continue with Google
        </button>


        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--ink-soft)", opacity: 0.2 }} />
          <span className="text-xs" style={{ color: "var(--ink-soft)" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--ink-soft)", opacity: 0.2 }} />
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b py-2 bg-transparent outline-none text-sm"
              style={{ borderColor: "var(--ink)" }}
            />
          )}
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b py-2 bg-transparent outline-none text-sm"
            style={{ borderColor: "var(--ink)" }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b py-2 bg-transparent outline-none text-sm"
            style={{ borderColor: "var(--ink)" }}
          />
        </div>

        {error && <p className="text-xs mt-3" style={{ color: "var(--terracotta)" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full mt-6 py-2.5 rounded-full font-mono text-sm uppercase tracking-widest"
          style={{ backgroundColor: "var(--terracotta)", color: "var(--parchment)" }}
        >
          {mode === "login" ? "Sign in" : "Sign up"}
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full mt-3 text-xs underline"
          style={{ color: "var(--ink-soft)" }}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}