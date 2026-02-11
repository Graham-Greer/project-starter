import { Section, FeatureSplitSection } from "../../patterns";
import styles from "./hero-split.module.css";

export default function HeroSplit({ className = "", ...props }) {
  return (
    <Section density="lg" className={`${styles.root} ${className}`.trim()}>
      <FeatureSplitSection {...props} />
    </Section>
  );
}
