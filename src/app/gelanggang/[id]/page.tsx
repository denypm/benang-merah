"use client";

import React, { useEffect, useState, use } from "react";
import styles from "../gelanggang.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";

export default function GelanggangDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [comp, setComp] = useState<any>(null);

  useEffect(() => {
    async function fetchCompetition() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!error && data) {
        setComp(data);
      }
    }
    fetchCompetition();
  }, [id]);

  if (!comp) {
    return (
      <>
        <Navbar />
        <main className={`container ${styles.container} fade-in`}>
          <div className={styles.header}>
            <p className={styles.subtitle}>Memuat gelanggang...</p>
          </div>
        </main>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <main className={`container ${styles.container} fade-in`}>
        <div className={styles.header} style={{ marginBottom: "2rem" }}>
          <span className={`${styles.badge} ${
            comp.status === 'active' ? styles.badgeActive : 
            comp.status === 'judging' ? styles.badgeJudging : 
            styles.badgeCompleted
          }`} style={{ marginBottom: "1.5rem", display: "inline-block" }}>
            {comp.status === 'active' ? 'Terbuka' : 
             comp.status === 'judging' ? 'Penjurian' : 'Selesai'}
          </span>
          <h1 className={styles.title}>{comp.title}</h1>
          <div className="red-thread-short" style={{ margin: "1.5rem auto" }} />
          <div className={styles.cardTheme} style={{ fontSize: "1rem" }}>Tema: {comp.theme}</div>
        </div>

        <div style={{ background: "var(--bg-card)", padding: "3rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Deskripsi Gelanggang</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>{comp.description}</p>
          </div>
          
          <div style={{ marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Tenggat Waktu</h3>
              <p style={{ fontWeight: 600 }}>{formatDate(comp.end_date)}</p>
            </div>
            <div>
              <h3 style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Penghargaan</h3>
              <p style={{ fontWeight: 600, color: "var(--accent-gold)" }}>{comp.prize}</p>
            </div>
          </div>

          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px dashed var(--border-light)", textAlign: "center" }}>
            {comp.status === 'active' ? (
              <Link 
                href={`/workspace?comp_id=${comp.id}&comp_title=${encodeURIComponent(comp.title)}`} 
                style={{
                  display: "inline-block",
                  padding: "1rem 3rem",
                  background: "var(--accent-crimson)",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  borderRadius: "var(--radius-full)",
                  textDecoration: "none",
                  transition: "var(--transition-fast)",
                  boxShadow: "var(--shadow-sm)"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Mulai Menulis untuk Gelanggang Ini
              </Link>
            ) : (
              <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                Pengiriman karya untuk gelanggang ini telah ditutup.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
