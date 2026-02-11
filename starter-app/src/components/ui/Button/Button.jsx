import Link from "next/link";
import { Icon } from "../../primitives";
import styles from "./button.module.css";

function renderIcon(icon) {
  if (!icon) return null;
  if (typeof icon === "string") {
    return <Icon name={icon} size="1rem" decorative={true} />;
  }
  return icon;
}

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  tone = "neutral",
  href,
  target,
  rel,
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  ...props
}) {
  const resolvedVariant =
    variant === "solid"
      ? "primary"
      : variant === "outline"
        ? "secondary"
        : variant === "ghost"
          ? "tertiary"
          : variant;

  const isDisabled = disabled || loading;
  const classes = [
    styles.button,
    styles[resolvedVariant] || styles.primary,
    styles[size] || styles.md,
    styles[tone] || styles.neutral,
    fullWidth ? styles.fullWidth : "",
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {renderIcon(iconLeft)}
      <span className={styles.label}>{children}</span>
      {renderIcon(iconRight)}
    </>
  );

  if (href && !isDisabled) {
    const computedRel = target === "_blank" && !rel ? "noopener noreferrer" : rel;

    return (
      <Link className={classes} href={href} target={target} rel={computedRel} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} disabled={isDisabled} aria-busy={loading} {...props}>
      {content}
    </button>
  );
}
