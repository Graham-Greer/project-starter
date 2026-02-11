import { Button } from "../../ui";
import { Section } from "../../patterns";
import { Heading, Text } from "../../primitives";
import styles from "./footer-cta-split.module.css";

export default function FooterCtaSplit({ title, description, primaryAction, secondaryAction, className = "", ...props }) {
  return (
    <Section tone="muted" density="md" className={`${styles.section} ${className}`.trim()} {...props}>
      <div className={styles.layout}>
        <div>
          <Heading as="h3" size="h4" weight="bold">{title}</Heading>
          {description ? <Text as="p" size="sm">{description}</Text> : null}
        </div>
        <div className={styles.actions}>
          {primaryAction ? <Button href={primaryAction.href} variant="primary" tone="brand" iconRight="arrowRight">{primaryAction.label}</Button> : null}
          {secondaryAction ? <Button href={secondaryAction.href} variant="secondary" tone="neutral">{secondaryAction.label}</Button> : null}
        </div>
      </div>
    </Section>
  );
}
