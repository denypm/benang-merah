"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import styles from "./reading.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const mockAnnotations = [
  { blockId: "block-1", author: "Kurator", text: "Perbandingan antara 'ritual' dan 'berburu' memberikan kontras yang kuat sejak awal." },
  { blockId: "block-3", author: "Kurator", text: "Ini adalah inti esai. Paragraf yang sangat kuat—biarkan ia bernapas." },
];

const renderText = (textNode: any, idx: number) => {
  let element: any = textNode.text;
  if (textNode.marks) {
    textNode.marks.forEach((mark: any) => {
      if (mark.type === 'bold') element = <strong key={idx}>{element}</strong>;
      if (mark.type === 'italic') element = <em key={idx}>{element}</em>;
      if (mark.type === 'strike') element = <del key={idx}>{element}</del>;
    });
  }
  return <React.Fragment key={idx}>{element}</React.Fragment>;
};

const renderBlock = (block: any, index: number, annotations: any[], activeNote: string | null, setActiveNote: (id: string | null) => void) => {
  // Generate a predictable ID if none exists for demo purposes
  const blockId = block.attrs?.id || `block-${index}`;
  const annotation = annotations.find(a => a.blockId === blockId);
  const isActive = activeNote === blockId;

  let content = null;
  if (block.type === 'paragraph') {
    content = <p className={styles.paragraph}>{block.content?.map(renderText) || <br/>}</p>;
  } else if (block.type === 'heading') {
    const level = block.attrs?.level || 2;
    const Tag = `h${level}` as any;
    content = <Tag className={styles.heading}>{block.content?.map(renderText)}</Tag>;
  } else if (block.type === 'blockquote') {
    content = <blockquote className={styles.blockquote}>{block.content?.map(renderText)}</blockquote>;
  } else if (block.type === 'image') {
    content = <img src={block.attrs?.src} alt={block.attrs?.alt || ''} className={styles.image} />;
  } else {
    // Fallback
    return null;
  }

  return (
    <div
      key={blockId}
      className={`${styles.paraWrap} ${isActive ? styles.paraActive : ""} ${annotation ? styles.paraHasNote : ""}`}
      onClick={() => setActiveNote(isActive ? null : blockId)}
    >
      {content}
      {annotation && isActive && (
        <aside className={styles.annotation}>
          <span className={styles.annotationLabel}>Catatan {annotation.author}:</span>
          <p className={styles.annotationText}>{annotation.text}</p>
        </aside>
      )}
    </div>
  );
};

export default function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [article, setArticle] = useState<any>(null);
  const [annotations] = useState(mockAnnotations);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("articles")
          .select("*, profiles(full_name)")
          .eq("id", id)
          .single();

        if (!error && data) {
          setArticle(data);
        } else {
          setArticle(null); // or set some error state
        }
      } catch {
        setArticle(null);
      }
    }
    fetchArticle();
  }, [id]);

  const handleScroll = useCallback(() => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    setProgress(height > 0 ? (winScroll / height) * 100 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (!article) {
    return (
      <main className={styles.readingLayout}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingThread} />
          <p className={styles.loadingText}>Menenun Kata...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.readingLayout} ${focusMode ? styles.focusActive : ""}`} id="reading-page">
      {/* Vertical Crimson Thread — Reading Progress */}
      <div className={styles.verticalThread}>
        <div className={styles.verticalThreadFill} style={{ height: `${progress}%` }} />
      </div>

      <article className={styles.article}>
        {/* Header */}
        <header className={styles.header}>
          {!focusMode && (
            <Link href="/" className={styles.backLink}>← Kembali</Link>
          )}

          <h1 className={styles.title}>{article.title}</h1>

          <div className={styles.meta}>
            <span>Oleh: {article.profiles?.full_name || "Penulis"}</span>
          </div>

          {/* Red thread divider */}
          <div className={styles.headerThread} />

          {!focusMode && (
            <button className={styles.focusBtn} onClick={() => setFocusMode(true)} id="enter-focus">
              Mode Zen
            </button>
          )}
        </header>

        {/* Content */}
        <section className={styles.content}>
          {article.content?.content?.map((block: any, index: number) => 
            renderBlock(block, index, annotations, activeNote, setActiveNote)
          )}
        </section>

        {/* End */}
        <footer className={styles.articleEnd}>
          <div className={styles.endThread} />
          <p className={styles.endText}>— Akhir —</p>
          <Link href="/" className={styles.endLink}>Kembali ke Beranda</Link>
        </footer>
      </article>

      {/* Focus mode hint */}
      {focusMode && (
        <button className={styles.exitFocus} onClick={() => setFocusMode(false)}>
          Tekan ESC untuk keluar
        </button>
      )}
    </main>
  );
}
