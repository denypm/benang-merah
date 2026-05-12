"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Untuk Anda");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch competitions
      const { data: compData } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'active')
        .limit(2);
        
      if (compData) setCompetitions(compData);

      // Fetch articles
      const { data: articleData } = await supabase
        .from('articles')
        .select('*, profiles(full_name, avatar_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (articleData) {
        setArticles(articleData);
        // Simple trending sort by likes (mocking trending)
        setTrendingArticles([...articleData].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 3));
      }

      // Fetch Following Authors
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(full_name, avatar_url)')
          .eq('follower_id', user.id);
        
        if (followsData) {
          // Flatten structure
          const formattedFollowing = followsData.map((f: any) => ({
            id: f.following_id,
            ...f.profiles
          }));
          setFollowing(formattedFollowing);
        }
      }

      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <main className={styles.dashboardContainer} style={{ paddingTop: "56px" }}>
        
        {/* LEFT COLUMN: NAVIGATION */}
        <aside className={styles.leftSidebar}>
          <div className={styles.navGroup}>
            <Link href="/" className={`${styles.sideNavBtn} ${styles.active}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Beranda
            </Link>
            <Link href="/suaka" className={styles.sideNavBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
              Tersimpan
            </Link>
            <Link href="/gelanggang" className={styles.sideNavBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
              Gelanggang
            </Link>
            <Link href="/workspace" className={styles.sideNavBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Mulai Menulis
            </Link>
          </div>
          
          <div className={styles.navGroup}>
            <h4 className={styles.navGroupTitle}>Penulis Diikuti</h4>
            <div className={styles.followingList}>
              {following.length === 0 ? (
                <div style={{fontSize: "0.75rem", color: "var(--text-tertiary)"}}>Belum mengikuti siapa pun.</div>
              ) : (
                following.map((author) => (
                  <Link href={`/profil/${author.id}`} key={author.id} style={{textDecoration: 'none', color: 'inherit'}}>
                    <div className={styles.followingItem}>
                      <div className={styles.avatarSmall}>
                        {author.avatar_url ? (
                          <img src={author.avatar_url} alt="" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                        ) : (
                          author.full_name?.charAt(0) || "P"
                        )}
                      </div>
                      <span>{author.full_name || "Penulis"}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: MAIN FEED */}
        <section className={styles.mainFeed}>
          <div className={styles.feedTabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Untuk Anda' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('Untuk Anda')}
            >
              Untuk Anda
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Pilihan Kurator' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('Pilihan Kurator')}
            >
              Pilihan Kurator
            </button>
          </div>

          <div className={styles.feedList}>
            {articles.map((article) => (
              <article key={article.id} className={styles.articleCard}>
                <div className={styles.articleContent}>
                  <div className={styles.articleAuthor}>
                    <div className={styles.avatarTiny}>
                      {article.profiles?.avatar_url ? (
                        <img src={article.profiles.avatar_url} alt="" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                      ) : (
                        article.profiles?.full_name?.charAt(0) || "A"
                      )}
                    </div>
                    <span>{article.profiles?.full_name || "Anonim"}</span>
                    <span className={styles.authorDot}>·</span>
                    <span className={styles.articleDate}>
                      {new Date(article.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <Link href={`/read/${article.id}`} className={styles.articleLink}>
                    <h2 className={styles.articleTitle}>{article.title}</h2>
                    <p className={styles.articleExcerpt}>{article.excerpt}</p>
                  </Link>
                  
                  <div className={styles.articleMeta}>
                    <div className={styles.metaLeft}>
                      <span className={styles.metaTag}>{article.category}</span>
                      <span className={styles.metaTime}>{article.read_time} baca</span>
                    </div>
                    <div className={styles.metaRight}>
                      <button className={styles.iconBtn} title="Suka">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span className={styles.iconCount}>{article.likes_count || 0}</span>
                      </button>
                      <button className={styles.iconBtn} title="Komentar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span className={styles.iconCount}>{article.comments_count || 0}</span>
                      </button>
                      <button className={styles.iconBtn} title="Simpan">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Optional Thumbnail */}
                <Link href={`/read/${article.id}`} className={styles.articleThumbnail}>
                  <div className={styles.thumbnailPlaceholder} style={{ background: article.id === '1' ? 'var(--shape-yellow)' : article.id === '2' ? 'var(--shape-red)' : 'var(--bg-paper-darker)' }}>
                     <span style={{opacity: 0.5}}>T</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: WIDGETS */}
        <aside className={styles.rightSidebar}>
          
          {/* Gelanggang Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetDot}></span>
              <h3>Gelanggang Aktif</h3>
            </div>
            <div className={styles.widgetContent}>
              {competitions.map((comp) => (
                <div key={comp.id} className={styles.compWidget}>
                  <h4>{comp.title}</h4>
                  <p>{comp.theme}</p>
                  <Link href={`/gelanggang/${comp.id}`}>Lihat Lomba →</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <h3>Sedang Tren</h3>
            </div>
            <div className={styles.widgetContent}>
              {trendingArticles.length > 0 ? trendingArticles.map((article, i) => (
                <div key={article.id} className={styles.trendWidget}>
                  <div className={styles.trendNumber}>0{i + 1}</div>
                  <div className={styles.trendInfo}>
                    <div className={styles.trendAuthor}>
                      <div className={styles.avatarTiny}>{article.profiles?.full_name?.charAt(0) || "A"}</div>
                      <span>{article.profiles?.full_name || "Anonim"}</span>
                    </div>
                    <h4><Link href={`/read/${article.id}`} style={{color: 'inherit', textDecoration: 'none'}}>{article.title}</Link></h4>
                  </div>
                </div>
              )) : (
                <p style={{fontSize: '0.8rem', color: 'var(--text-tertiary)'}}>Belum ada tren</p>
              )}
            </div>
          </div>

          <div className={styles.footerLinks}>
            <Link href="/tentang">Tentang</Link>
            <Link href="/panduan">Panduan</Link>
            <Link href="/privasi">Privasi</Link>
            <Link href="/ketentuan">Ketentuan</Link>
          </div>

        </aside>
      </main>
    </>
  );
}
