import Link from "next/link";
import { Text } from "../../primitives";
import styles from "./footer-simple.module.css";

export default function FooterSimple({ brand = "Starter", links = [], copyright, className = "", ...props }) {
  return (
    <footer className={`${styles.footer} ${className}`.trim()} {...props}>
      <div className={styles.inner}>
        <Text as="p" size="sm" tone="secondary">{copyright || `© ${new Date().getFullYear()} ${brand}`}</Text>
        <nav className={styles.links} aria-label="Footer navigation">
          {links.map((link, index) => (
            <Link key={link.href || index} href={link.href || "#"} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
