import { Badge, Button, Card } from "../../ui";
import { Grid, Heading, Stack, Text } from "../../primitives";
import styles from "./pricing-table.module.css";

export default function PricingTable({ plans = [], className = "", ...props }) {
  return (
    <Grid
      className={`${styles.grid} ${className}`.trim()}
      minColumnWidth="16rem"
      gap="var(--space-5)"
      {...props}
    >
      {plans.map((plan, index) => (
        <Card
          key={plan.id || plan.name || index}
          variant={plan.featured ? "elevated" : "outlined"}
          className={`${styles.card} ${plan.featured ? styles.featured : ""}`.trim()}
        >
          <Stack gap="var(--space-4)" className={styles.planContent}>
            {plan.badge ? <Badge tone={plan.featured ? "brand" : "neutral"}>{plan.badge}</Badge> : null}
            <Heading as="h3" size="h4" weight="semibold">
              {plan.name}
            </Heading>
            <div>
              <Heading as="p" size="h3" weight="bold">
                {plan.price}
              </Heading>
              {plan.interval ? (
                <Text as="p" size="sm" tone="muted">
                  {plan.interval}
                </Text>
              ) : null}
            </div>
            {plan.description ? <Text as="p">{plan.description}</Text> : null}
            {Array.isArray(plan.features) ? (
              <ul className={styles.features}>
                {plan.features.map((feature, featureIndex) => (
                  <li key={`${plan.name}-feature-${featureIndex}`}>{feature}</li>
                ))}
              </ul>
            ) : null}
            <div className={styles.ctaRow}>
              {plan.cta ? (
                <Button
                  href={plan.cta.href}
                  variant={plan.featured ? "primary" : "secondary"}
                  tone={plan.featured ? "brand" : "neutral"}
                  iconRight="arrowRight"
                  fullWidth
                >
                  {plan.cta.label}
                </Button>
              ) : null}
            </div>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
