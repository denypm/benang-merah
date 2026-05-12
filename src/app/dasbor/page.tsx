"use client";

import React, { useState, useEffect } from "react";
import styles from "./dasbor.module.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DasborPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [stats, setStats] = useState({ views: 0, likes: 0, followers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/masuk";
          return;
        }

        // Fetch articles
        const { data: articlesData } = await supabase
          .from("articles")
          .select("*")
          .eq("author_id", user.id)
          .order("created_at", { ascending: false });

        if (articlesData) {
          setArticles(articlesData);
          
          // Calculate aggregate stats
          const totalViews = articlesData.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
          const totalLikes = articlesData.reduce((acc, curr) => acc + (curr.likes_count || 0), 0);
          
          // Fetch followers (mocking query since we just created the table and it might be empty)
          const { count: followersCount } = await supabase
            .from("follows")
            .select('*', { count: 'exact', head: true })
            .eq("following_id", user.id);

          setStats({
            views: totalViews,
            likes: totalLikes,
            followers: followersCount || 0
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} style={{ paddingTop: "56px" }}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dasbor Analitik</h1>
            <p className={styles.subtitle}>Pantau performa tulisan Anda dan apresiasi dari pembaca.</p>
          </div>
          <Link href="/workspace" className={styles.newDraftBtn}>
            Tulis Karya Baru
          </Link>
        </div>

        {isLoading ? (
          <div>Memuat analitik...</div>
        ) : (
          <>
            {/* The Ego Engine Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.views}</span>
                <span className={styles.statLabel}>Total Tayangan</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.likes}</span>
                <span className={styles.statLabel}>Total Suka</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.followers}</span>
                <span className={styles.statLabel}>Pengikut</span>
              </div>
            </div>

            {/* Content Management */}
            <h2 className={styles.sectionTitle}>Karya Anda</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Status</th>
                    <th>Tayangan</th>
                    <th>Suka</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                        Belum ada karya. Mulai tuangkan ide Anda sekarang.
                      </td>
                    </tr>
                  ) : (
                    articles.map(article => (
                      <tr key={article.id}>
                        <td>
                          {article.status === 'published' ? (
                            <Link href={`/read/${article.id}`} className={styles.articleTitle}>
                              {article.title || "Tanpa Judul"}
                            </Link>
                          ) : (
                            <Link href={`/workspace?comp_id=${article.id}`} className={styles.articleTitle}>
                              {article.title || "Tanpa Judul"}
                            </Link>
                          )}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${article.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                            {article.status}
                          </span>
                        </td>
                        <td>{article.views_count || 0}</td>
                        <td>{article.likes_count || 0}</td>
                        <td>{new Date(article.created_at).toLocaleDateString('id-ID')}</td>
                        <td>
                          <div className={styles.actionLinks}>
                            <Link href="/workspace" className={styles.actionLink}>Edit</Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
