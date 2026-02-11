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
  const hasMedia = Boolean(media?.src || media?.videoSrc);
  const mediaSrc = media?.videoSrc || media?.src;
  const mediaMimeType = media?.mimeType || "";
  const isVideoByMime = mediaMimeType.startsWith("video/");
  const isVideoByExtension = typeof mediaSrc === "string" && /\.(mp4|webm|ogg)$/i.test(mediaSrc);
  const isVideo = media?.kind === "video" || Boolean(media?.videoSrc) || isVideoByMime || isVideoByExtension;

  return (
    <Section
      density="lg"
      container={!hasMedia}
      className={`${styles.section} ${hasMedia ? styles.withMedia : ""} ${className}`.trim()}
      {...props}
    >
      {hasMedia ? (
        <>
          <div className={styles.mediaLayer} aria-hidden="true">
            {isVideo ? (
              <>
                {media.poster ? (
                  <Image
                    src={media.poster}
                    alt=""
                    width={media.width || 1920}
                    height={media.height || 1080}
                    fill
                    radius="none"
                    objectFit="cover"
                    sizes="100vw"
                    className={styles.poster}
                    priority
                  />
                ) : null}
                <video
                  className={styles.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={media.poster}
                  tabIndex={-1}
                >
                  <source src={mediaSrc} type={mediaMimeType || "video/mp4"} />
                </video>
              </>
            ) : (
              <Image
                src={mediaSrc}
                alt={media.alt || ""}
                width={media.width || 1920}
                height={media.height || 1080}
                fill
                radius="none"
                objectFit="cover"
                sizes="100vw"
                priority
              />
            )}
          </div>
          <div className={styles.overlay} aria-hidden="true" />
        </>
      ) : null}

      <div className={`${styles.content} ${hasMedia ? styles.contentOnMedia : ""}`.trim()}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          eyebrowTone={hasMedia ? "onMedia" : "muted"}
          titleTone={hasMedia ? "var(--color-neutral-50)" : undefined}
          descriptionTone={hasMedia ? "onMedia" : "secondary"}
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
      </div>
    </Section>
  );
}
