import AiCodeReviews from "./bento/ai-code-reviews"
import RealtimeCodingPreviews from "./bento/real-time-previews"
import OneClickIntegrationsIllustration from "./bento/one-click-integrations-illustration"
import MCPConnectivityIllustration from "./bento/mcp-connectivity-illustration" // Updated import
import EasyDeployment from "./bento/easy-deployment"
import ParallelCodingAgents from "./bento/parallel-agents" // Updated import

const BentoCard = ({ title, description, Component }) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative bg-[rgba(20,20,22,0.8)]">
    {/* Simple gradient overlay instead of backdrop-filter */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-lg font-normal leading-7">
          {title} <br />
          <span className="text-muted-foreground">{description}</span>
        </p>
      </div>
    </div>
    <div className="self-stretch h-96 relative -mt-0.5 z-10">
      <Component />
    </div>
  </div>
)

export function BentoSection() {
  const cards = [
    {
      title: "AI Lead Generation.",
      description: "Intelligent lead capture and qualification that works around the clock.",
      Component: AiCodeReviews,
    },
    {
      title: "AI Voice Agents",
      description: "Natural conversation AI that handles appointments and support calls 24/7.",
      Component: RealtimeCodingPreviews,
    },
    {
      title: "AI Chatbots",
      description: "Smart chatbots that engage visitors and convert them into customers.",
      Component: OneClickIntegrationsIllustration,
    },
    {
      title: "Custom AI Automations",
      description: "Bespoke AI workflows designed specifically for your business needs.",
      Component: MCPConnectivityIllustration, // Updated component
    },
    {
      title: "CRM Integration", // Swapped position
      description: "Seamlessly connect your AI systems with your existing CRM and tools.",
      Component: ParallelCodingAgents, // Updated component
    },
    {
      title: "24/7 Availability", // Swapped position
      description: "Your AI systems never sleep, capturing opportunities around the clock.",
      Component: EasyDeployment,
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent contain-content">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[400px] h-[600px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[80px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              AI Solutions That Scale
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              We build intelligent automation systems that transform how you work. From lead generation to customer support, our AI works 24/7.
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
