import styles from "./cta-group.module.css";

export default function CTAGroup({
  className = "",
  children,
  align = "left",
  wrap = true,
  ...props
}) {
  const rootClassName = [
    styles.group,
    styles[align] || styles.left,
    wrap ? styles.wrap : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} {...props}>
      {children}
    </div>
  );
}
