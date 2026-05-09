"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const controlNavbar = useCallback(() => {
    if (typeof window !== "undefined") {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 30);

      if (currentY > lastScrollY && currentY > 120) {
        setIsVisible(false);
        setIsMenuOpen(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentY);
    }
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [controlNavbar]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <nav
        id="main-navbar"
        className={`${styles.navbar} ${isVisible ? styles.visible : styles.hidden} ${isScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoIcon}>
              <circle cx="20" cy="20" r="18" fill="var(--shape-red)" />
              <path d="M12 20 C 16 10, 24 30, 28 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className={styles.logoText}>BENANG MERAH</span>
          </Link>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input type="text" placeholder="Cari tulisan, penulis, atau topik..." className={styles.searchInput} />
          </div>

          {/* Desktop Right Nav */}
          <div className={styles.desktopNav}>
            <Link href="/workspace" className={styles.writeBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Tulis
            </Link>
            <Link href="/masuk" className={styles.profileBtn}>
              <div className={styles.avatar}>PM</div>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={styles.hamburgerBtn}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
            id="navbar-toggle"
          >
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.lineOpen1 : ""}`} />
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.lineOpen2 : ""}`} />
          </button>
        </div>

        {/* Crimson Thread Line */}
        <div className={styles.threadLine} />
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMenuOpen(false)}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileSearch}>
              <input type="text" placeholder="Cari tulisan..." className={styles.searchInputMobile} />
            </div>
            <Link href="/workspace" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
              Tulis Karya
            </Link>
            <Link href="/suaka" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
              Suaka / Tersimpan
            </Link>
            <Link href="/profil" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
              Profil
            </Link>
            <div className={styles.mobileDivider} />
            <Link href="/masuk" className={styles.mobileLinkAccent} onClick={() => setIsMenuOpen(false)}>
              Keluar
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
