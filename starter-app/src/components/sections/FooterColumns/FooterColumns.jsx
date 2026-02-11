import Link from "next/link";
import { Heading, Text } from "../../primitives";
import styles from "./footer-columns.module.css";

export default function FooterColumns({ brand = "Starter", description, columns = [], legal = [], className = "", ...props }) {
  return (
    <footer className={`${styles.footer} ${className}`.trim()} {...props}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Heading as="p" size="h5" weight="semibold">{brand}</Heading>
          {description ? <Text as="p" size="sm" tone="secondary">{description}</Text> : null}
        </div>
        <div className={styles.columns}>
          {columns.map((column, index) => (
            <section key={column.title || index}>
              <Heading as="p" size="h6" weight="semibold">{column.title}</Heading>
              <ul className={styles.list}>
                {(column.links || []).map((link, linkIndex) => (
                  <li key={link.href || linkIndex}>
                    <Link href={link.href || "#"} className={styles.link}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <div className={styles.legal}>
        {legal.map((item, index) => (
          <Link key={item.href || index} href={item.href || "#"} className={styles.link}>{item.label}</Link>
        ))}
      </div>
    </footer>
  );
}
