import Link from "next/link";
import { Button } from "../../ui";
import { PRIMARY_NAV_LINKS } from "../navigation-links";
import styles from "./mobile-menu-drawer.module.css";

export default function MobileMenuDrawer({ isOpen, onClose, pathname, controlsId }) {
  const isContactPage = pathname === "/contact";

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <nav
        id={controlsId}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
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
          className={`${styles.cta} ${isContactPage ? styles.activeCta : ""}`}
          aria-current={isContactPage ? "page" : undefined}
        >
          Contact
        </Button>
      </nav>
    </>
  );
}
