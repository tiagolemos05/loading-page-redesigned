import { HeroSection } from "@/components/hero-section"
import { SocialProof } from "@/components/social-proof"
import { BentoSection } from "@/components/bento-section"
import { TestimonialGridSection } from "@/components/testimonial-grid-section"
import { FAQSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { FooterSection } from "@/components/footer-section"
import { AnimatedSection } from "@/components/animated-section"
import { ForceDarkMode } from "@/components/force-dark-mode"

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Node Wave and who is it for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Node Wave is an automation agency that builds custom workflow solutions for businesses looking to streamline their operations. We specialize in internal process automation, Salesforce integrations, and tailored n8n workflows for companies who want to eliminate manual, repetitive work.',
      },
    },
    {
      '@type': 'Question',
      name: 'What kind of processes can you automate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We automate internal workflows like document generation, license creation, email management, meeting note compilation, CRM data entry, lead qualification, and much more. If your team is doing something manually and repeatedly, there\'s a good chance we can automate it.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with Salesforce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Salesforce integrations are one of our core strengths. We connect Salesforce to your other tools and build automated workflows that keep your data in sync, trigger actions based on CRM events, and eliminate manual data entry.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does implementation take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Implementation timelines vary based on complexity. Simple automations can be deployed within 1-2 weeks, while more complex custom workflows may take 4-8 weeks. We\'ll provide a detailed timeline during our initial consultation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What tools do you use to build automations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We primarily use n8n for building workflows, along with direct API integrations. We also work with Zapier, Make, and other platforms depending on your existing tech stack and specific requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'What kind of ROI can I expect?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most of our clients see significant ROI within the first 3 months. Automation typically reduces operational costs by 40-60% while freeing up your team to focus on higher-value work. We\'ll help you track and measure the impact of every automation we build.',
      },
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ForceDarkMode />
      <div className="relative z-10">
        <main className="max-w-[1320px] mx-auto relative">
          <HeroSection />
        </main>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto px-6 mt-8 md:mt-16" delay={0.1}>
          <SocialProof />
        </AnimatedSection>
        <AnimatedSection id="features-section" className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <BentoSection />
        </AnimatedSection>


        <AnimatedSection
          id="testimonials-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-4 md:mt-16"
          delay={0.2}
        >
          <TestimonialGridSection />
        </AnimatedSection>
        <AnimatedSection id="faq-section" className="relative z-10 max-w-[1320px] mx-auto mt-4 md:mt-16" delay={0.2}>
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection
          id="contact-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-4 md:mt-16"
          delay={0.2}
        >
          <ContactSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-4 md:mt-16" delay={0.2}>
          <FooterSection />
        </AnimatedSection>
      </div>
    </div>
  )
}
