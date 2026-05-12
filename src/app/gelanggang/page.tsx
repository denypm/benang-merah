"use client";

import React, { useEffect, useState } from "react";
import styles from "./gelanggang.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";

export default function GelanggangPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("competitions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setCompetitions(data);
        }
      } catch {
        console.error("Gagal memuat gelanggang");
      } finally {
        setLoading(false);
      }
    }
    fetchCompetitions();
  }, []);

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
      <main className={`container-wide ${styles.container} fade-in`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gelanggang</h1>
          <div className="red-thread-short" style={{ margin: "1.5rem auto" }} />
          <p className={styles.subtitle}>
            Ruang tarung aksara. Temukan panggilan menulis, tuangkan gagasan terbaik Anda, dan biarkan karya Anda diuji oleh para kurator kami.
          </p>
        </div>

        <div className={styles.grid}>
          {competitions.map((comp) => (
            <div key={comp.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>{comp.title}</h2>
                  <div className={styles.cardTheme}>{comp.theme}</div>
                </div>
                <span className={`${styles.badge} ${
                  comp.status === 'active' ? styles.badgeActive : 
                  comp.status === 'judging' ? styles.badgeJudging : 
                  styles.badgeCompleted
                }`}>
                  {comp.status === 'active' ? 'Terbuka' : 
                   comp.status === 'judging' ? 'Penjurian' : 'Selesai'}
                </span>
              </div>
              
              <p className={styles.cardDesc}>{comp.description}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.deadline}>
                  <span>Hingga: {formatDate(comp.end_date)}</span>
                </div>
                
                {comp.status === 'active' ? (
                  <Link href={`/gelanggang/${comp.id}`} className={styles.actionBtn}>
                    Lihat Detail
                  </Link>
                ) : (
                  <Link href={`/gelanggang/${comp.id}`} className={styles.actionBtnDisabled}>
                    Ditutup
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
