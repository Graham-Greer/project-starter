import { CTASection } from "../../patterns";
import styles from "./cta-section-centered.module.css";

export default function CTASectionCentered({ className = "", ...props }) {
  return <CTASection align="center" className={`${styles.root} ${className}`.trim()} {...props} />;
}
