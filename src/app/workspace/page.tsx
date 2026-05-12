"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import styles from "./workspace.module.css";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Image as ImageIcon, Heading2 } from 'lucide-react';

const MOODS = ["Kontemplatif", "Melankolis", "Inspiratif", "Gelisah"];

export default function Workspace() {
  return (
    <Suspense fallback={<div className={styles.layout}>Memuat...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const compId = searchParams.get("comp_id");
  const compTitle = searchParams.get("comp_title");

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("Kontemplatif");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [wordCount, setWordCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);

  // Fetch User
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchDrafts(user.id);
      } else {
        window.location.href = "/masuk"; // Redirect if not logged in
      }
    }
    fetchUser();
  }, []);

  const fetchDrafts = async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", uid)
      .eq("status", "draft")
      .order("updated_at", { ascending: false });
    if (data) setDrafts(data);
  };

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content: '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'ProseMirror',
        'data-placeholder': 'Mulai menulis benang merahmu di sini...',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(JSON.stringify(editor.getJSON()));
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) setIsFocusMode(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFocusMode, title, content, mood]);

  // Auto-save every 30s
  useEffect(() => {
    if (!title && !content) return;
    const timer = setTimeout(() => handleSave(true), 30000);
    return () => clearTimeout(timer);
  }, [title, content]);

  const handleSave = useCallback(async (silent = false) => {
    if (!title.trim() && !content.trim()) return;
    if (!userId) return;
    if (!silent) setSaveStatus("saving");

    try {
      const supabase = createClient();
      const payload: any = {
        title: title || "Tanpa Judul",
        excerpt: content.substring(0, 200),
        content: JSON.parse(content),
        mood,
        status: "draft",
        author_id: userId,
        updated_at: new Date().toISOString()
      };
      
      if (currentArticleId) payload.id = currentArticleId;

      const { data, error } = await supabase.from("articles").upsert(payload).select().single();
      
      if (data && !currentArticleId) {
         setCurrentArticleId(data.id);
      }
      fetchDrafts(userId);
    } catch {
      localStorage.setItem("benang-merah-draft", JSON.stringify({ title, content, mood }));
    }

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [title, content, mood, userId, currentArticleId]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    if (!userId) return;
    setSaveStatus("saving");

    try {
      const supabase = createClient();
      const payload: any = {
        title,
        excerpt: content.substring(0, 200),
        content: JSON.parse(content),
        mood,
        status: "published",
        read_time: `${Math.ceil(wordCount / 200)} min`,
        author_id: userId,
        updated_at: new Date().toISOString()
      };
      
      if (currentArticleId) payload.id = currentArticleId;

      const { data, error } = await supabase.from("articles").upsert(payload).select().single();

      if (!error && data && compId) {
        // If tied to a competition, insert entry (assuming competition_entries table exists, or we skip if not defined in schema yet)
        try {
           await supabase.from("competition_entries").insert({
             competition_id: compId,
             article_id: data.id,
           });
        } catch(e) {}
      }
    } catch {
      localStorage.setItem("benang-merah-submission", JSON.stringify({ title, content, mood }));
    }

    setSaveStatus("saved");
    alert("Karya berhasil dikirim/diterbitkan!");
    window.location.href = "/";
  };

  // Load draft from localstorage or when clicking a draft
  useEffect(() => {
    const draft = localStorage.getItem("benang-merah-draft");
    if (draft && editor && !currentArticleId) {
      try {
        const { title: t, content: c, mood: m } = JSON.parse(draft);
        if (t) setTitle(t);
        if (m) setMood(m);
        if (c && c.startsWith('{')) {
          editor.commands.setContent(JSON.parse(c));
          setContent(c);
        }
      } catch { /* ignore */ }
    }
  }, [editor, currentArticleId]);

  const loadDraftToEditor = (draftObj: any) => {
    setCurrentArticleId(draftObj.id);
    setTitle(draftObj.title);
    setMood(draftObj.mood);
    if (draftObj.content && editor) {
      editor.commands.setContent(draftObj.content);
      setContent(JSON.stringify(draftObj.content));
    }
  };

  return (
    <div className={`${styles.layout} ${isFocusMode ? styles.focusLayout : ""}`} id="workspace-page">
      {/* Left Sidebar — Drafts */}
      {!isFocusMode && sidebarOpen && (
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>My Drafts</span>
            <button className={styles.newDraftBtn} title="New draft">+</button>
          </div>
          <div className={styles.draftList}>
            {drafts.map((draft) => (
              <button key={draft.id} className={styles.draftItem} onClick={() => loadDraftToEditor(draft)}>
                <span className={styles.draftName}>{draft.title || "Tanpa Judul"}</span>
                <span className={styles.draftTime}>{new Date(draft.updated_at).toLocaleDateString('id-ID')}</span>
              </button>
            ))}
            {drafts.length === 0 && (
              <div style={{fontSize: "0.8rem", color: "var(--text-tertiary)", padding: "1rem"}}>Belum ada draf.</div>
            )}
          </div>
          <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.sidebarBack}>← Beranda</Link>
          </div>
        </aside>
      )}

      {/* Main Editor Area */}
      <main className={styles.editorMain}>
        {/* Top Bar */}
        {!isFocusMode && (
          <div className={styles.topBar}>
            <div className={styles.topLeft}>
              {!sidebarOpen && (
                <button className={styles.toggleSidebar} onClick={() => setSidebarOpen(true)}>☰</button>
              )}
              {sidebarOpen && (
                <button className={styles.toggleSidebar} onClick={() => setSidebarOpen(false)}>◁</button>
              )}
              <select
                className={styles.moodSelect}
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className={styles.topRight}>
              {compTitle && (
                <span style={{ fontSize: "0.75rem", color: "var(--accent-crimson)", fontWeight: 600, marginRight: "1rem", border: "1px solid var(--accent-crimson-medium)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)" }}>
                  Draft untuk: {compTitle}
                </span>
              )}
              <span className={styles.statusText}>
                {saveStatus === "saving" ? "Menyimpan..." : saveStatus === "saved" ? "Tersimpan" : ""}
              </span>
              <button className={styles.focusToggle} onClick={() => setIsFocusMode(true)}>
                Zen
              </button>
            </div>
          </div>
        )}

        {/* Focus Mode Exit */}
        {isFocusMode && (
          <button className={styles.exitZen} onClick={() => setIsFocusMode(false)}>
            Keluar Zen (ESC)
          </button>
        )}

        {/* Writing Canvas */}
        <div className={styles.canvas}>
          <input
            type="text"
            placeholder="Judul..."
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id="editor-title"
          />
          <div className={styles.canvasThread} />
          
          
          {editor && (
            <div className={styles.staticToolbar}>
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.toolbarBtnActive : styles.toolbarBtn} title="Tebal">
                <Bold size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.toolbarBtnActive : styles.toolbarBtn} title="Miring">
                <Italic size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? styles.toolbarBtnActive : styles.toolbarBtn} title="Coret">
                <Strikethrough size={16} />
              </button>
              <div className={styles.toolbarDivider} />
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.toolbarBtnActive : styles.toolbarBtn} title="Subjudul">
                <Heading2 size={16} />
              </button>
              <div className={styles.toolbarDivider} />
              <button onClick={() => {
                const url = window.prompt('URL Gambar (Contoh: https://...):');
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }} className={styles.toolbarBtn} title="Tambahkan Gambar">
                <ImageIcon size={16} />
              </button>
            </div>
          )}
          
          <div className={styles.editorContainer}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Bottom Status */}
        <div className={`${styles.bottomBar} ${isFocusMode ? styles.bottomBarFocus : ""}`}>
          <div className={styles.bottomLeft}>
            <span className={styles.wordCount}>
              {wordCount} kata · ~{Math.ceil(wordCount / 200)} min baca
            </span>
            <span className={styles.lastSaved}>
              {saveStatus === "saved" ? "Baru disimpan" : ""}
            </span>
          </div>
          <button className={styles.submitBtnLarge} onClick={handleSubmit} id="submit-btn-large">
            {compId ? "Kirim Lomba" : "Kirim Kurator"}
          </button>
        </div>
      </main>
    </div>
  );
}
