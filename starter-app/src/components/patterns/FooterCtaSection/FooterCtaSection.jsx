import { Button } from "../../ui";
import { Heading, Text } from "../../primitives";
import styles from "./footer-cta-section.module.css";

export default function FooterCtaSection({
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
  ...props
}) {
  return (
    <section className={`${styles.section} ${className}`.trim()} {...props}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <Heading as="h2" size="h3" weight="bold" className={styles.title}>
            {title}
          </Heading>
          {description ? (
            <Text as="p" size="base" tone="secondary" className={styles.description}>
              {description}
            </Text>
          ) : null}
        </div>
        <div className={styles.actions}>
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
        </div>
      </div>
    </section>
  );
}
