import { Accordion } from "../../ui";
import { Stack } from "../../primitives";
import SectionHeader from "../SectionHeader";
import styles from "./faq-section.module.css";

export default function FAQSection({
  eyebrow,
  title = "Frequently asked questions",
  description,
  items = [],
  ...props
}) {
  return (
    <Stack className={styles.root} gap="var(--space-8)" {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <Accordion type="single" collapsible items={items} />
    </Stack>
  );
}
