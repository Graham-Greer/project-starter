import { Card, Image } from "../../ui";
import { Grid, Heading, Stack, Text } from "../../primitives";
import styles from "./testimonial-grid.module.css";

export default function TestimonialGrid({ items = [], className = "", ...props }) {
  return (
    <Grid
      className={`${styles.grid} ${className}`.trim()}
      minColumnWidth="18rem"
      gap="var(--space-5)"
      {...props}
    >
      {items.map((item, index) => (
        <Card key={item.id || item.author || index} variant="outlined" className={styles.card}>
          <Stack gap="var(--space-4)" className={styles.content}>
            <Text as="blockquote" size="base" tone="secondary" className={styles.quote}>
              “{item.quote}”
            </Text>
            <div className={styles.person}>
              {item.avatar ? (
                <Image
                  kind="avatar"
                  src={item.avatar.src}
                  alt={item.avatar.alt || item.author}
                  width={48}
                  height={48}
                  radius="full"
                  wrapperClassName={styles.avatar}
                />
              ) : null}
              <div className={styles.identity}>
                <Heading as="p" size="h6" weight="semibold" className={styles.name}>
                  {item.author}
                </Heading>
                {item.role ? (
                  <Text as="p" size="sm" tone="muted" className={styles.role}>
                    {item.role}
                  </Text>
                ) : null}
              </div>
            </div>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
