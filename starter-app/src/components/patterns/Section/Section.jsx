import styles from "./section.module.css";

export default function Section({
  as: Component = "section",
  className = "",
  children,
  container = true,
  density = "md",
  tone = "default",
  ...props
}) {
  const rootClassName = [
    styles.section,
    styles[density] || styles.md,
    styles[tone] || styles.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={rootClassName} {...props}>
      {container ? <div className={styles.inner}>{children}</div> : children}
    </Component>
  );
}
