import { Button, Image } from "../../ui";
import { CTAGroup, Section, SectionHeader } from "../../patterns";
import styles from "./hero-centered.module.css";

export default function HeroCentered({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  media,
  className = "",
  ...props
}) {
  return (
    <Section density="lg" className={`${styles.section} ${className}`.trim()} {...props}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="center"
        actions={
          <CTAGroup align="center">
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
      {media?.src ? (
        <Image
          src={media.src}
          alt={media.alt || ""}
          width={media.width || 1280}
          height={media.height || 720}
          aspectRatio={media.aspectRatio || "16 / 9"}
          radius="lg"
          wrapperClassName={styles.media}
        />
      ) : null}
    </Section>
  );
}
