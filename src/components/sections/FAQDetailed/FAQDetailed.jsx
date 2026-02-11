import { Section, FAQSection, SectionHeader } from "../../patterns";
import { Text } from "../../primitives";
import styles from "./faq-detailed.module.css";

export default function FAQDetailed({ title, description, helperText, items = [], className = "", ...props }) {
  return (
    <Section density="lg" className={className} {...props}>
      <div className={styles.layout}>
        <div>
          <SectionHeader title={title} description={description} />
          {helperText ? <Text as="p" size="sm" tone="muted">{helperText}</Text> : null}
        </div>
        <FAQSection items={items} title={null} description={null} />
      </div>
    </Section>
  );
}
