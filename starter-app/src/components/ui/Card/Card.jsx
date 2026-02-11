import Link from "next/link";
import { Heading, Stack, Surface, Text } from "../../primitives";
import styles from "./card.module.css";

const PADDING_TO_SURFACE = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export default function Card({
  as = "article",
  className = "",
  variant = "outlined",
  padding = "md",
  interactive = false,
  href,
  title,
  description,
  media,
  actions,
  children,
  ...props
}) {
  const rootClassName = [
    styles.card,
    styles[variant] || styles.outlined,
    interactive || href ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <Surface
      as={as}
      variant="flat"
      padding={PADDING_TO_SURFACE[padding] || "md"}
      className={rootClassName}
      {...props}
    >
      <Stack gap="var(--space-4)" className={styles.content}>
        {media ? <div className={styles.media}>{media}</div> : null}
        {title ? (
          <Heading as="h3" size="h4" weight="semibold" className={styles.title}>
            {title}
          </Heading>
        ) : null}
        {description ? (
          <Text as="p" size="base" tone="secondary" className={styles.description}>
            {description}
          </Text>
        ) : null}
        {children}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </Stack>
    </Surface>
  );

  if (href) {
    const linkRel = props.target === "_blank" && !props.rel ? "noopener noreferrer" : props.rel;
    return (
      <Link href={href} className={styles.linkWrap} target={props.target} rel={linkRel}>
        {content}
      </Link>
    );
  }

  return content;
}
