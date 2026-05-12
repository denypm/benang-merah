"use client";

import React, { useState, useEffect, use } from "react";
import styles from "./profil.module.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const supabase = createClient();
        
        // Get current user to check follow status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch published articles
        const { data: articlesData } = await supabase
          .from("articles")
          .select("*")
          .eq("author_id", id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (articlesData) {
          setArticles(articlesData);
        }

        // Check if following
        if (user && user.id !== id) {
          const { data: followData } = await supabase
            .from("follows")
            .select("*")
            .eq("follower_id", user.id)
            .eq("following_id", id)
            .single();
            
          if (followData) setIsFollowing(true);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      alert("Anda harus masuk untuk mengikuti penulis.");
      return;
    }

    const supabase = createClient();
    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", id);
        setIsFollowing(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: id });
        setIsFollowing(true);
        
        // Optional: Create notification
        await supabase.from("notifications").insert({
          user_id: id,
          actor_id: currentUserId,
          type: "follow"
        });
      }
    } catch (error) {
      console.error("Failed to toggle follow", error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loading} style={{ paddingTop: "100px" }}>Memuat profil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loading} style={{ paddingTop: "100px" }}>Profil tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} style={{ paddingTop: "56px" }}>
        
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatarImage} />
            ) : (
              profile.full_name?.charAt(0) || "P"
            )}
          </div>
          <h1 className={styles.name}>{profile.full_name || "Penulis Tanpa Nama"}</h1>
          <p className={styles.bio}>{profile.bio || "Penulis ini belum menuliskan biografi."}</p>
          
          {currentUserId !== id && (
            <button 
              className={`${styles.followBtn} ${isFollowing ? styles.unfollowBtn : ''}`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? "Mengikuti" : "Ikuti"}
            </button>
          )}
          {currentUserId === id && (
            <Link href="/dasbor" className={styles.followBtn} style={{ textDecoration: 'none' }}>
              Lihat Dasbor
            </Link>
          )}
        </div>

        {/* Articles List */}
        <h2 className={styles.sectionTitle}>Karya Diterbitkan</h2>
        {articles.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Belum ada karya yang diterbitkan.</p>
        ) : (
          <div className={styles.articlesGrid}>
            {articles.map((article) => (
              <article key={article.id} className={styles.articleCard}>
                <span className={styles.articleDate}>
                  {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <Link href={`/read/${article.id}`} className={styles.articleTitle}>
                  {article.title}
                </Link>
                <p className={styles.articleExcerpt}>
                  {article.excerpt || "Tidak ada cuplikan tersedia untuk karya ini."}
                </p>
              </article>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
