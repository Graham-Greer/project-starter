import {
  CTASectionSplit,
  FAQDetailed,
  FooterColumns,
  HeroCentered,
} from "@/components/sections";
import { CONTACT_PAGE, SITE_FOOTER } from "@/lib/content";

export const metadata = {
  title: "Starter | Contact",
  description: "Get in touch to scope your implementation or migration.",
};

export default function ContactPage() {
  return (
    <>
      <HeroCentered id="top" {...CONTACT_PAGE.hero} />
      <FAQDetailed id="process" {...CONTACT_PAGE.process} />
      <CTASectionSplit id="explore" {...CONTACT_PAGE.cta} />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}
