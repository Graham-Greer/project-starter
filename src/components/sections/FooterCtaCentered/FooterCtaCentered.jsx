import { FooterCtaSection } from "../../patterns";
import styles from "./footer-cta-centered.module.css";

export default function FooterCtaCentered({ className = "", ...props }) {
  return <FooterCtaSection className={`${styles.root} ${className}`.trim()} {...props} />;
}
