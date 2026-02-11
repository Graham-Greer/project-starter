import NextImage from "next/image";
import styles from "./image.module.css";

const RADIUS_MAP = {
  none: "var(--border-radius-none)",
  sm: "var(--border-radius-sm)",
  md: "var(--border-radius-md)",
  lg: "var(--border-radius-lg)",
  xl: "var(--border-radius-xl)",
  full: "var(--border-radius-full)",
};

export default function Image({
  className = "",
  wrapperClassName = "",
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = "100vw",
  priority = false,
  quality,
  aspectRatio = "auto",
  objectFit = "cover",
  radius = "md",
  ...props
}) {
  const wrapperStyle = {
    "--image-aspect-ratio": aspectRatio,
    "--image-radius": RADIUS_MAP[radius] || RADIUS_MAP.md,
  };

  return (
    <span className={`${styles.wrapper} ${wrapperClassName}`.trim()} style={wrapperStyle}>
      <NextImage
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={`${styles.image} ${className}`.trim()}
        style={{ objectFit, ...props.style }}
        {...props}
      />
    </span>
  );
}
