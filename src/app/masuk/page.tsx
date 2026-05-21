"use client";

import React, { useState } from "react";
import styles from "./masuk.module.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";

export default function MasukPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan kata sandi harus diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email atau kata sandi salah.");
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setError(err.message || "Gagal terhubung. Pastikan env Vercel sudah diset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background Geometry */}
      <div className={styles.geoCircle} />
      <div className={styles.geoSquare} />

      <Navbar />

      {/* Main Content */}
      <main className={styles.main} style={{ paddingTop: "56px" }}>
        <div className={styles.container}>
          {/* Heading */}
          <div className={styles.heading}>
            <h1 className={styles.title}>MASUK</h1>
            <p className={styles.subtitle}>Kembali ke ruang baca Anda.</p>
          </div>

          {/* Form Card */}
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              {/* Email */}
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  EMAIL SUREL
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@domain.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                  KATA SANDI
                </label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      padding: "4px"
                    }}
                  >
                    {showPassword ? "Tutup" : "Lihat"}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className={styles.errorMsg}>{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              id="sign-in-btn"
            >
              {isLoading ? "MEMUAT..." : "SIGN IN"}
            </button>
          </form>

          {/* Thread Motif + Links */}
          <div className={styles.threadSection}>
            <div className={styles.threadLine}>
              <span className={styles.threadDot} />
              <span className={styles.threadDot} />
            </div>
            <div className={styles.linkRow}>
              <Link href="/lupa-password" className={styles.footerLink}>
                LUPA PASSWORD
              </Link>
              <Link href="/daftar" className={styles.footerLink}>
                DAFTAR BARU
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
