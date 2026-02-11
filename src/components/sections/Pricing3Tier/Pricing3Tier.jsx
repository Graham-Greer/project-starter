import { PricingTable, Section, SectionHeader } from "../../patterns";
import styles from "./pricing3-tier.module.css";

export default function Pricing3Tier({ eyebrow, title, description, plans = [], className = "", ...props }) {
  return (
    <Section tone="muted" density="lg" className={`${styles.root} ${className}`.trim()} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} align="center" />
      <PricingTable plans={plans.slice(0, 3)} />
    </Section>
  );
}
