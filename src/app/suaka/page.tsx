"use client";

import React, { useState, useEffect } from "react";
import styles from "./suaka.module.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function SuakaPage() {
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("bookmarks")
          .select("article_id, articles(*, profiles(full_name))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && !error) {
          // Extract articles from the nested join
          const formattedArticles = data.map((item: any) => item.articles);
          setSavedArticles(formattedArticles);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSaved();
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} style={{ paddingTop: "56px" }}>
        <div className={styles.header}>
          <h1 className={styles.title}>Suaka Tersimpan</h1>
          <p className={styles.subtitle}>Kumpulan karya yang Anda simpan untuk dibaca kembali.</p>
        </div>

        {isLoading ? (
          <div>Memuat...</div>
        ) : savedArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
            </svg>
            <h2>Belum ada karya di suaka Anda</h2>
            <p>Jelajahi berbagai tulisan menarik dan simpan ke suaka untuk membacanya nanti di saat tenang.</p>
            <Link href="/" className={styles.exploreBtn}>
              Jelajahi Beranda
            </Link>
          </div>
        ) : (
          <div className={styles.articlesGrid}>
            {savedArticles.map((article) => (
              <article key={article.id} className={styles.articleCard}>
                <div className={styles.articleMeta}>
                  <span>Oleh: {article.profiles?.full_name || "Tanpa Nama"}</span>
                  <span> • {new Date(article.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <Link href={`/read/${article.id}`} className={styles.articleTitle}>
                  {article.title}
                </Link>
                <p className={styles.articleExcerpt}>{article.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
