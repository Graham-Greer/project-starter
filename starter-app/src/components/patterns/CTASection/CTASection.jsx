import { Button } from "../../ui";
import CTAGroup from "../CTAGroup";
import SectionHeader from "../SectionHeader";
import Section from "../Section";
import styles from "./cta-section.module.css";

export default function CTASection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  align = "center",
  className = "",
  ...props
}) {
  return (
    <Section
      density="md"
      tone="muted"
      className={`${styles.section} ${className}`.trim()}
      {...props}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        align={align}
        actions={
          <CTAGroup align={align}>
            {primaryAction ? (
              <Button href={primaryAction.href} variant="primary" tone="brand" iconRight="arrowRight">
                {primaryAction.label}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button href={secondaryAction.href} variant="secondary" tone="neutral">
                {secondaryAction.label}
              </Button>
            ) : null}
          </CTAGroup>
        }
      />
    </Section>
  );
}
