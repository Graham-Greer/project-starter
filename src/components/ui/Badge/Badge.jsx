import styles from "./badge.module.css";

export default function Badge({
  as: Component = "span",
  className = "",
  children,
  variant = "subtle",
  tone = "neutral",
  size = "md",
  ...props
}) {
  const classes = [
    styles.badge,
    styles[variant] || styles.subtle,
    styles[tone] || styles.neutral,
    styles[size] || styles.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
