import {
  CTASectionCentered,
  FAQDetailed,
  FooterColumns,
  HeroCentered,
} from "@/components/sections";
import { FAQ_PAGE, SITE_FOOTER } from "@/lib/content";

export const metadata = {
  title: "Starter | FAQ",
  description: "Frequently asked questions about setup, customization, and scale.",
};

export default function FAQPage() {
  return (
    <>
      <HeroCentered id="top" {...FAQ_PAGE.hero} />
      <FAQDetailed id="questions" {...FAQ_PAGE.faq} />
      <CTASectionCentered id="cta" {...FAQ_PAGE.cta} />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}
