import { FooterColumns, HeroCentered } from "@/components/sections";
import { LegalDocumentSection } from "@/components/patterns";
import { SITE_FOOTER, TERMS_PAGE } from "@/lib/content";

export const metadata = {
  title: "Starter | Terms",
  description: "Terms of service for this starter template website.",
};

export default function TermsPage() {
  return (
    <>
      <HeroCentered {...TERMS_PAGE.hero} />
      <LegalDocumentSection
        title="Terms details"
        description="These terms summarize usage expectations and service boundaries."
        sections={TERMS_PAGE.document.sections}
      />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}
