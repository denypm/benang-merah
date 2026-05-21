"use client";

import React, { useState, useEffect } from "react";
import styles from "./superadmin.module.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function SuperadminPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, published: 0, drafts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const supabase = createClient();
        
        // Simple security check (in a real app, check for an admin role or specific email)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/masuk";
          return;
        }

        // Check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
          
        if (!profile || profile.role !== "superadmin") {
          window.location.href = "/";
          return;
        }

        // Fetch user count
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch articles count (published vs drafts)
        const { count: pubCount } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("status", "published");

        const { count: draftCount } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft");

        setStats({
          users: userCount || 0,
          published: pubCount || 0,
          drafts: draftCount || 0
        });

        // Fetch recent articles (all users)
        const { data: recentArticles } = await supabase
          .from("articles")
          .select("*, profiles(full_name)")
          .order("created_at", { ascending: false })
          .limit(50);

        if (recentArticles) {
          setArticles(recentArticles);
        }
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus artikel "${title}" secara permanen?`)) {
      return;
    }
    
    try {
      const supabase = createClient();
      await supabase.from("articles").delete().eq("id", id);
      setArticles(articles.filter(a => a.id !== id));
      alert("Artikel berhasil dihapus.");
    } catch (error) {
      alert("Gagal menghapus artikel.");
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} style={{ paddingTop: "56px" }}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dasbor Superadmin</h1>
            <p className={styles.subtitle}>Pusat kontrol dan pantauan aktivitas Benang Merah.</p>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Memuat data sistem...</div>
        ) : (
          <>
            {/* Global Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.users}</span>
                <span className={styles.statLabel}>Total Pengguna</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.published}</span>
                <span className={styles.statLabel}>Karya Diterbitkan</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.drafts}</span>
                <span className={styles.statLabel}>Draf Tersimpan</span>
              </div>
            </div>

            {/* Content Management */}
            <h2 className={styles.sectionTitle}>Semua Karya (Terbaru)</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Judul & Penulis</th>
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
                        Belum ada karya di platform ini.
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
                            <span className={styles.articleTitle}>{article.title || "Tanpa Judul"}</span>
                          )}
                          <div className={styles.authorName}>
                            Oleh: {article.profiles?.full_name || "Tanpa Nama"}
                          </div>
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
                            <button className={styles.deleteBtn} onClick={() => handleDelete(article.id, article.title)}>
                              Hapus
                            </button>
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
