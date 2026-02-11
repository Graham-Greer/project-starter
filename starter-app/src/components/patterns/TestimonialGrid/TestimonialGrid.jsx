import { Card, Grid, Image } from "../../ui";
import { Heading, Stack, Text } from "../../primitives";
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
        <Card key={item.id || item.author || index} variant="outlined">
          <Stack gap="var(--space-4)">
            <Text as="blockquote" size="base" tone="secondary" className={styles.quote}>
              “{item.quote}”
            </Text>
            <div className={styles.person}>
              {item.avatar ? (
                <Image
                  src={item.avatar.src}
                  alt={item.avatar.alt || item.author}
                  width={40}
                  height={40}
                  radius="full"
                  wrapperClassName={styles.avatar}
                />
              ) : null}
              <div>
                <Heading as="p" size="h6" weight="semibold">
                  {item.author}
                </Heading>
                {item.role ? (
                  <Text as="p" size="sm" tone="muted">
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
