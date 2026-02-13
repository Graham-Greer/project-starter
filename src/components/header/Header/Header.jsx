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
  const isCmsRoute = pathname?.startsWith("/cms");
  const [menuState, setMenuState] = useState({
    isOpen: false,
    openedOnPathname: null,
  });
  const isContactPage = pathname === "/contact";
  const mobileNavId = "site-mobile-nav";
  const isOpen = menuState.isOpen && menuState.openedOnPathname === pathname;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuState({
          isOpen: false,
          openedOnPathname: null,
        });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (isCmsRoute) {
    return null;
  }

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
              onToggle={() =>
                setMenuState((prev) => {
                  if (prev.isOpen && prev.openedOnPathname === pathname) {
                    return { isOpen: false, openedOnPathname: null };
                  }

                  return { isOpen: true, openedOnPathname: pathname };
                })
              }
              controlsId={mobileNavId}
            />
          </div>
        </div>
      </header>

      <MobileMenuDrawer
        isOpen={isOpen}
        onClose={() =>
          setMenuState({
            isOpen: false,
            openedOnPathname: null,
          })
        }
        pathname={pathname}
        controlsId={mobileNavId}
      />
    </>
  );
}
