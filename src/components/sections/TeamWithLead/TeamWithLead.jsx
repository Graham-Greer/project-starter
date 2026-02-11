import { TeamSection, Section, SectionHeader } from "../../patterns";
import { Image } from "../../ui";
import { Card } from "../../ui";
import { Heading, Text } from "../../primitives";
import styles from "./team-with-lead.module.css";

export default function TeamWithLead({ eyebrow, title, description, lead, members = [], className = "", ...props }) {
  return (
    <Section density="lg" className={className} {...props}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      {lead ? (
        <Card variant="elevated" className={styles.leadCard}>
          <div className={styles.leadLayout}>
            {lead.photo ? (
              <Image
                src={lead.photo.src}
                alt={lead.photo.alt || lead.name}
                width={360}
                height={300}
                aspectRatio="16 / 9"
                radius="md"
              />
            ) : null}
            <div>
              <Heading as="h3" size="h4" weight="semibold">{lead.name}</Heading>
              <Text as="p" size="sm" tone="muted">{lead.role}</Text>
              {lead.bio ? <Text as="p" size="base">{lead.bio}</Text> : null}
            </div>
          </div>
        </Card>
      ) : null}
      <TeamSection members={members} />
    </Section>
  );
}
