import {
  CTASectionSplit,
  FeatureSplitMediaLeft,
  FeatureSplitMediaRight,
  FooterColumns,
  HeroSplit,
} from "@/components/sections";
import { SERVICES_PAGE, SITE_FOOTER } from "@/lib/content";

export const metadata = {
  title: "Starter | Services",
  description: "Service offerings for architecture, migration, and component-first delivery.",
};

export default function ServicesPage() {
  const [firstOffering, secondOffering] = SERVICES_PAGE.offerings;

  return (
    <>
      <HeroSplit id="top" {...SERVICES_PAGE.hero} />
      <FeatureSplitMediaRight id="architecture" {...firstOffering} />
      <FeatureSplitMediaLeft id="migration" {...secondOffering} />
      <CTASectionSplit id="contact-services" {...SERVICES_PAGE.cta} />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}
