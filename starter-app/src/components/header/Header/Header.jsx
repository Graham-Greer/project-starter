"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MenuToggleButton from "../MenuToggleButton";
import MobileMenuDrawer from "../MobileMenuDrawer";
import { PRIMARY_NAV_LINKS } from "../navigation-links";
import { Button } from "../../ui";
import ThemeToggle from "../../theme/ThemeToggle";
import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isContactPage = pathname === "/contact";
  const mobileNavId = "site-mobile-nav";

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link className={styles.logo} href="/">
            Starter
          </Link>

          <nav className={styles.desktopNav} aria-label="Main navigation">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Button
              href="/contact"
              variant="primary"
              tone="neutral"
              iconRight="arrowRight"
              className={isContactPage ? styles.activeCta : ""}
              aria-current={isContactPage ? "page" : undefined}
            >
              Contact
            </Button>
          </nav>

          <div className={styles.actions}>
            <ThemeToggle />
            <MenuToggleButton
              isOpen={isOpen}
              onToggle={() => setIsOpen((prev) => !prev)}
              controlsId={mobileNavId}
            />
          </div>
        </div>
      </header>

      <MobileMenuDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pathname={pathname}
        controlsId={mobileNavId}
      />
    </>
  );
}
