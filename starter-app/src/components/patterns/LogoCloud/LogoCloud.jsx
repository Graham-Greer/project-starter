import { Image, LogoMarquee } from "../../ui";
import styles from "./logo-cloud.module.css";

export default function LogoCloud({
  items = [],
  useMarquee = false,
  className = "",
  ...props
}) {
  if (useMarquee) {
    return <LogoMarquee items={items} className={className} {...props} />;
  }

  return (
    <div className={`${styles.grid} ${className}`.trim()} {...props}>
      {items.map((item, index) => (
        <div key={item.id || item.name || index} className={styles.item}>
          <Image
            kind="logo"
            src={item.src}
            alt={item.alt || item.name || ""}
            width={item.width || 120}
            height={item.height || 32}
            wrapperClassName={styles.logoWrapper}
            className={styles.logoImage}
            radius="none"
            objectFit="contain"
          />
        </div>
      ))}
    </div>
  );
}
