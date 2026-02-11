import { FeatureSplitSection, Section } from "../../patterns";
import styles from "./feature-split-media-right.module.css";

export default function FeatureSplitMediaRight({ className = "", ...props }) {
  return (
    <Section density="lg" className={`${styles.root} ${className}`.trim()}>
      <FeatureSplitSection reverse={true} {...props} />
    </Section>
  );
}
