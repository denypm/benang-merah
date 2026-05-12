"use client";

import React, { useState } from "react";
import styles from "./daftar.module.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";

export default function DaftarPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError("Nama, Email dan kata sandi harus diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        setError(authError.message || "Gagal mendaftar.");
      } else {
        alert("Pendaftaran berhasil! Silakan cek email Anda atau login langsung jika email konfirmasi dimatikan.");
        window.location.href = "/masuk";
      }
    } catch {
      setError("Gagal terhubung. Coba lagi nanti.");
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
            <h1 className={styles.title}>DAFTAR</h1>
            <p className={styles.subtitle}>Bergabunglah dengan ruang tarung aksara.</p>
          </div>

          {/* Form Card */}
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              {/* Full Name */}
              <div className={styles.field}>
                <label htmlFor="fullName" className={styles.label}>
                  NAMA LENGKAP
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  className={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>

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
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
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
              {isLoading ? "MEMUAT..." : "DAFTAR SEKARANG"}
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
              <Link href="/masuk" className={styles.footerLink}>
                SUDAH PUNYA AKUN? MASUK
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
