import styles from "./box.module.css";

export default function Box({ as: Component = "div", className = "", children, ...props }) {
  return (
    <Component className={`${styles.box} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
