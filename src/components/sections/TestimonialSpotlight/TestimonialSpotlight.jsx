import { Card } from "../../ui";
import { Section, SectionHeader, TestimonialGrid } from "../../patterns";
import { Heading, Text } from "../../primitives";
import styles from "./testimonial-spotlight.module.css";

export default function TestimonialSpotlight({ eyebrow, title, description, highlight, items = [], className = "", ...props }) {
  return (
    <Section density="lg" className={className} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      {highlight ? (
        <Card variant="elevated" className={styles.highlight}>
          <Text as="blockquote" size="lg">“{highlight.quote}”</Text>
          <Heading as="p" size="h5" weight="semibold">{highlight.author}</Heading>
          {highlight.role ? <Text as="p" size="sm" tone="muted">{highlight.role}</Text> : null}
        </Card>
      ) : null}
      <TestimonialGrid items={items} />
    </Section>
  );
}
