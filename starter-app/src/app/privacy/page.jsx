import { FooterColumns, HeroCentered } from "@/components/sections";
import { LegalDocumentSection } from "@/components/patterns";
import { PRIVACY_PAGE, SITE_FOOTER } from "@/lib/content";

export const metadata = {
  title: "Starter | Privacy",
  description: "Privacy policy for this starter template website.",
};

export default function PrivacyPage() {
  return (
    <>
      <HeroCentered {...PRIVACY_PAGE.hero} />
      <LegalDocumentSection
        title="Privacy details"
        description="This policy describes core data handling practices for inquiries and website usage."
        sections={PRIVACY_PAGE.document.sections}
      />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}
