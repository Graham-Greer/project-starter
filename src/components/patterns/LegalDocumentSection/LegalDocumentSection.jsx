import { Heading, Stack, Text } from "../../primitives";
import Section from "../Section";
import SectionHeader from "../SectionHeader";
import styles from "./legal-document-section.module.css";

export default function LegalDocumentSection({
  eyebrow,
  title,
  description,
  sections = [],
  className = "",
  ...props
}) {
  return (
    <Section density="lg" className={`${styles.section} ${className}`.trim()} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <Stack className={styles.content} gap="var(--space-8)">
        {sections.map((section, index) => (
          <article key={section.id || section.title || index} className={styles.block}>
            {section.title ? (
              <Heading as="h3" size="h5" weight="semibold">
                {section.title}
              </Heading>
            ) : null}
            <Stack gap="var(--space-3)">
              {(section.paragraphs || []).map((paragraph, paragraphIndex) => (
                <Text key={`${section.id || index}-paragraph-${paragraphIndex}`} as="p" size="base">
                  {paragraph}
                </Text>
              ))}
            </Stack>
            {Array.isArray(section.items) && section.items.length ? (
              <ul className={styles.list}>
                {section.items.map((item, itemIndex) => (
                  <li key={`${section.id || index}-item-${itemIndex}`}>
                    <Text as="span" size="base">
                      {item}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </Stack>
    </Section>
  );
}
