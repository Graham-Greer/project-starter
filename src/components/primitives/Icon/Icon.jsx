import styles from "./icon.module.css";

const ICONS = {
  sun: "light_mode",
  moon: "dark_mode",
  menu: "menu",
  close: "close",
  chevronDown: "keyboard_arrow_down",
  chevronUp: "keyboard_arrow_up",
  chevronRight: "chevron_right",
  plus: "add",
  minus: "remove",
  arrowRight: "arrow_forward",
  edit: "edit",
  trash: "delete",
  gripVertical: "drag_indicator",
};

export default function Icon({
  name,
  className = "",
  size = "1rem",
  title,
  decorative = true,
  ...props
}) {
  const glyph = ICONS[name];

  if (!glyph) {
    return null;
  }

  const iconStyle = {
    "--icon-size": size,
    ...props.style,
  };

  return (
    <span
      className={`${styles.icon} ${styles.materialIcon} material-symbols-outlined ${className}`.trim()}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : title}
      role={decorative ? undefined : "img"}
      {...props}
      style={iconStyle}
    >
      {glyph}
    </span>
  );
}
