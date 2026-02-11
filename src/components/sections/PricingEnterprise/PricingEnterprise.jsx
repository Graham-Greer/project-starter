import { Badge } from "../../ui";
import { PricingTable, Section, SectionHeader } from "../../patterns";
import { Text } from "../../primitives";
import styles from "./pricing-enterprise.module.css";

export default function PricingEnterprise({ eyebrow, title, description, plans = [], enterpriseNote, className = "", ...props }) {
  return (
    <Section density="lg" className={className} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} align="left" />
      <div className={styles.noteRow}>
        <Badge tone="brand" variant="subtle">Enterprise Ready</Badge>
        {enterpriseNote ? <Text as="p" size="sm" tone="secondary">{enterpriseNote}</Text> : null}
      </div>
      <PricingTable plans={plans} />
    </Section>
  );
}
