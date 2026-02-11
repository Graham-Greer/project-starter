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

const KIND_PRESETS = {
  content: {
    aspectRatio: "16 / 9",
    objectFit: "cover",
  },
  avatar: {
    aspectRatio: "1 / 1",
    objectFit: "cover",
  },
  logo: {
    aspectRatio: "auto",
    objectFit: "contain",
  },
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
  kind = "content",
  aspectRatio,
  objectFit,
  radius = "md",
  ...props
}) {
  const preset = KIND_PRESETS[kind] || KIND_PRESETS.content;
  const resolvedAspectRatio = aspectRatio ?? preset.aspectRatio;
  const resolvedObjectFit = objectFit ?? preset.objectFit;

  const wrapperStyle = {
    "--image-aspect-ratio": resolvedAspectRatio,
    "--image-radius": RADIUS_MAP[radius] || RADIUS_MAP.md,
  };

  return (
    <span
      className={`${styles.wrapper} ${fill ? styles.fillWrapper : ""} ${wrapperClassName}`.trim()}
      style={wrapperStyle}
    >
      <NextImage
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={`${styles.image} ${fill ? styles.fillImage : ""} ${className}`.trim()}
        style={{ objectFit: resolvedObjectFit, ...props.style }}
        {...props}
      />
    </span>
  );
}
