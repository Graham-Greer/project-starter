import { FeatureSplitSection, Section } from "../../patterns";
import styles from "./feature-split-media-left.module.css";

export default function FeatureSplitMediaLeft({ className = "", ...props }) {
  return (
    <Section density="lg" className={`${styles.root} ${className}`.trim()}>
      <FeatureSplitSection reverse={false} {...props} />
    </Section>
  );
}
