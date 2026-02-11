import { Card, Grid, Image } from "../../ui";
import { Heading, Text } from "../../primitives";
import styles from "./team-section.module.css";

export default function TeamSection({ members = [], className = "", ...props }) {
  return (
    <Grid
      className={`${styles.grid} ${className}`.trim()}
      minColumnWidth="14rem"
      gap="var(--space-5)"
      {...props}
    >
      {members.map((member, index) => (
        <Card
          key={member.id || member.name || index}
          variant="outlined"
          media={
            member.photo ? (
              <Image
                src={member.photo.src}
                alt={member.photo.alt || member.name}
                width={400}
                height={360}
                aspectRatio="4 / 3"
                radius="md"
              />
            ) : null
          }
        >
          <Heading as="h3" size="h5" weight="semibold">
            {member.name}
          </Heading>
          {member.role ? (
            <Text as="p" size="sm" tone="muted" className={styles.role}>
              {member.role}
            </Text>
          ) : null}
          {member.bio ? (
            <Text as="p" size="sm" tone="secondary" className={styles.bio}>
              {member.bio}
            </Text>
          ) : null}
        </Card>
      ))}
    </Grid>
  );
}
