import Image from "next/image"

const testimonials = [
  {
    quote:
      "What used to take our team hours of manual data entry now happens automatically. The Salesforce integration they built has completely transformed how we handle license requests.",
    name: "Annette Black",
    company: "Operations Director",
    avatar: "/images/avatars/annette-black.png",
    type: "large-teal",
  },
  {
    quote:
      "They understood our workflow challenges immediately and delivered a solution that actually fits how we work, not the other way around.",
    name: "Dianne Russell",
    company: "Project Manager",
    avatar: "/images/avatars/dianne-russell.png",
    type: "small-dark",
  },
  {
    quote:
      "Our inbox was chaos before. Now every project email is automatically sorted, duplicates removed, and nothing falls through the cracks.",
    name: "Cameron Williamson",
    company: "Team Lead",
    avatar: "/images/avatars/cameron-williamson.png",
    type: "small-dark",
  },
  {
    quote:
      "The meeting documentation system saves us at least an hour per meeting. Notes get compiled into structured documents automatically.",
    name: "Robert Fox",
    company: "Account Executive",
    avatar: "/images/avatars/robert-fox.png",
    type: "small-dark",
  },
  {
    quote:
      "We expected a generic solution but got something completely tailored to our specific needs. That made all the difference.",
    name: "Darlene Robertson",
    company: "Business Owner",
    avatar: "/images/avatars/darlene-robertson.png",
    type: "small-dark",
  },
  {
    quote:
      "Professional, responsive, and they actually listen. The automation they built handles tasks we didn't even realize could be automated.",
    name: "Cody Fisher",
    company: "Marketing Director",
    avatar: "/images/avatars/cody-fisher.png",
    type: "small-dark",
  },
  {
    quote:
      "We went from spending half our day on repetitive admin tasks to having everything handled automatically. The ROI was obvious within the first month.",
    name: "Albert Flores",
    company: "Founder & CEO",
    avatar: "/images/avatars/albert-flores.png",
    type: "large-light",
  },
]

const TestimonialCard = ({ quote, name, company, avatar, type, isMobile = false }) => {
  const isLargeCard = type.startsWith("large")
  const avatarSize = isLargeCard ? 48 : 36
  const avatarBorderRadius = isLargeCard ? "rounded-[41px]" : "rounded-[30.75px]"
  
  // Mobile cards are uniform size for carousel
  const padding = isMobile ? "p-5" : (isLargeCard ? "p-5 md:p-6" : "p-5 md:p-[30px]")

  let cardClasses = `flex flex-col justify-between items-start overflow-hidden rounded-[10px] shadow-[0px_2px_4px_rgba(0,0,0,0.08)] relative ${padding}`
  let quoteClasses = ""
  let nameClasses = ""
  let companyClasses = ""
  let backgroundElements = null
  let cardHeight = ""
  let cardWidth = isMobile ? "w-[280px] flex-shrink-0" : "w-full md:w-[384px]"

  if (type === "large-teal") {
    cardClasses += " bg-primary"
    quoteClasses += isMobile 
      ? " text-primary-foreground text-base font-medium leading-6" 
      : " text-primary-foreground text-xl md:text-2xl font-medium leading-7 md:leading-8"
    nameClasses += " text-primary-foreground text-sm font-normal leading-5"
    companyClasses += " text-primary-foreground/60 text-sm font-normal leading-5"
    cardHeight = isMobile ? "h-[220px]" : "min-h-[350px] md:h-[502px]"
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/large-card-background.svg')", zIndex: 0 }}
      />
    )
  } else if (type === "large-light") {
    cardClasses += " bg-[rgba(231,236,235,0.12)]"
    quoteClasses += isMobile 
      ? " text-foreground text-base font-medium leading-6" 
      : " text-foreground text-xl md:text-2xl font-medium leading-7 md:leading-8"
    nameClasses += " text-foreground text-sm font-normal leading-5"
    companyClasses += " text-muted-foreground text-sm font-normal leading-5"
    cardHeight = isMobile ? "h-[220px]" : "min-h-[350px] md:h-[502px]"
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/images/large-card-background.svg')", zIndex: 0 }}
      />
    )
  } else {
    cardClasses += " bg-card outline outline-1 outline-border outline-offset-[-1px]"
    quoteClasses += isMobile 
      ? " text-foreground/80 text-sm font-normal leading-5" 
      : " text-foreground/80 text-base md:text-[17px] font-normal leading-6"
    nameClasses += " text-foreground text-sm font-normal leading-[22px]"
    companyClasses += " text-muted-foreground text-sm font-normal leading-[22px]"
    cardHeight = isMobile ? "h-[220px]" : "min-h-[200px] md:h-[244px]"
  }

  return (
    <div className={`${cardClasses} ${cardWidth} ${cardHeight}`}>
      {backgroundElements}
      <div className={`relative z-10 font-normal break-words line-clamp-5 ${quoteClasses}`}>{quote}</div>
      <div className="relative z-10 flex justify-start items-center gap-3 mt-4">
        <Image
          src={avatar || "/placeholder.svg"}
          alt={`${name} avatar`}
          width={avatarSize}
          height={avatarSize}
          className={`${avatarBorderRadius}`}
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)", width: isMobile ? 32 : avatarSize, height: isMobile ? 32 : avatarSize }}
        />
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className={nameClasses}>{name}</div>
          <div className={companyClasses}>{company}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialGridSection() {
  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start py-6 md:py-8 lg:py-14">
      <div className="self-stretch py-4 md:py-8 lg:py-14 flex flex-col justify-center items-center gap-2">
        <div className="flex flex-col justify-start items-center gap-3 md:gap-4">
          <h2 className="text-center text-foreground text-2xl md:text-4xl lg:text-[40px] font-semibold leading-tight md:leading-tight lg:leading-[40px]">
            Real Results, Real Impact
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-xs md:text-sm lg:text-base font-medium leading-relaxed">
            See how businesses are saving time and eliminating manual work with custom automation solutions.
          </p>
        </div>
      </div>
      
      {/* Mobile: Horizontal scroll carousel */}
      <div className="md:hidden w-full overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
        <div className="flex gap-3 w-max">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} isMobile={true} />
          ))}
        </div>
      </div>
      
      {/* Desktop: Grid layout */}
      <div className="hidden md:flex w-full pt-0.5 pb-4 md:pb-6 lg:pb-10 flex-row justify-center items-start gap-4 lg:gap-6 max-w-[1100px] mx-auto">
        <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[0]} />
          <TestimonialCard {...testimonials[1]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[2]} />
          <TestimonialCard {...testimonials[3]} />
          <TestimonialCard {...testimonials[4]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[5]} />
          <TestimonialCard {...testimonials[6]} />
        </div>
      </div>
    </section>
  )
}
