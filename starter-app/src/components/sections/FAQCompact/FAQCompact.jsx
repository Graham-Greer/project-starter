import { Section, FAQSection } from "../../patterns";
import styles from "./faq-compact.module.css";

export default function FAQCompact({ className = "", ...props }) {
  return (
    <Section density="lg" className={`${styles.root} ${className}`.trim()}>
      <FAQSection {...props} />
    </Section>
  );
}
