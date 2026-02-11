import Link from "next/link";
import Image from "../Image";
import styles from "./logo-marquee.module.css";

const SPEED_MAP = {
  slow: "36s",
  normal: "24s",
  fast: "14s",
};

export default function LogoMarquee({
  items = [],
  speed = "normal",
  direction = "left",
  pauseOnHover = true,
  ariaLabel = "Partner logos",
  className = "",
  ...props
}) {
  const shouldAnimate = items.length > 0;
  const trackItems = shouldAnimate ? [...items, ...items] : [];
  const marqueeStyle = {
    "--marquee-duration": SPEED_MAP[speed] || SPEED_MAP.normal,
    "--marquee-direction": direction === "right" ? "reverse" : "normal",
  };

  return (
    <div
      className={`${styles.marquee} ${pauseOnHover ? styles.pauseOnHover : ""} ${className}`.trim()}
      style={marqueeStyle}
      role="region"
      aria-label={ariaLabel}
      {...props}
    >
      <div className={styles.track}>
        {trackItems.map((item, index) => {
          const content = (
            <Image
              kind="logo"
              src={item.src}
              alt={item.alt || item.name || ""}
              width={item.width || 120}
              height={item.height || 32}
              className={styles.logoImage}
              wrapperClassName={styles.logoWrapper}
              radius="none"
              objectFit="contain"
            />
          );

          return item.href ? (
            <Link
              key={`${item.id || item.name || "logo"}-${index}`}
              href={item.href}
              className={styles.item}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
            >
              {content}
            </Link>
          ) : (
            <div key={`${item.id || item.name || "logo"}-${index}`} className={styles.item}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
