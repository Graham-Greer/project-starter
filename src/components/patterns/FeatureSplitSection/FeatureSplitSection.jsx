import { isValidElement } from "react";
import { Button, Image } from "../../ui";
import { Heading, Stack, Text } from "../../primitives";
import styles from "./feature-split-section.module.css";

export default function FeatureSplitSection({
  title,
  description,
  media,
  primaryAction,
  secondaryAction,
  reverse = false,
  className = "",
  ...props
}) {
  return (
    <div className={`${styles.root} ${reverse ? styles.reverse : ""} ${className}`.trim()} {...props}>
      <Stack gap="var(--space-4)" className={styles.content}>
        <Heading as="h3" size="h2" weight="bold">
          {title}
        </Heading>
        {description ? <Text as="p" size="lg">{description}</Text> : null}
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
      </Stack>
      <div className={styles.media}>
        {media?.src ? (
          <Image
            src={media.src}
            alt={media.alt || ""}
            width={media.width || 960}
            height={media.height || 640}
            aspectRatio={media.aspectRatio || "16 / 9"}
            radius="lg"
          />
        ) : isValidElement(media) ? (
          media
        ) : null}
      </div>
    </div>
  );
}
