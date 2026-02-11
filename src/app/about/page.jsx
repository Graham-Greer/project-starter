import {
  FooterColumns,
  FooterCtaSplit,
  HeroSplit,
  StatsCards,
  TeamWithLead,
  TestimonialSpotlight,
} from "@/components/sections";
import { ABOUT_PAGE, SITE_FOOTER } from "@/lib/content";

export const metadata = {
  title: "Starter | About",
  description: "Learn about the team and principles behind this starter template.",
};

export default function AboutPage() {
  return (
    <>
      <HeroSplit id="top" {...ABOUT_PAGE.hero} />
      <StatsCards id="stats" {...ABOUT_PAGE.stats} />
      <TeamWithLead id="team" {...ABOUT_PAGE.team} />
      <TestimonialSpotlight id="testimonials" {...ABOUT_PAGE.testimonials} />
      <FooterCtaSplit
        id="cta"
        title="Want to build with this team?"
        description="Tell us your goals and constraints. We will outline a practical implementation path."
        primaryAction={{ label: "Contact", href: "/contact" }}
        secondaryAction={{ label: "Services", href: "/services" }}
      />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}
