"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "What is Node Wave and who is it for?",
    answer:
      "Node Wave is an automation agency that builds custom workflow solutions for businesses looking to streamline their operations. We specialize in internal process automation, Salesforce integrations, and tailored n8n workflows for companies who want to eliminate manual, repetitive work.",
  },
  {
    question: "What kind of processes can you automate?",
    answer:
      "We automate internal workflows like document generation, license creation, email management, meeting note compilation, CRM data entry, lead qualification, and much more. If your team is doing something manually and repeatedly, there's a good chance we can automate it.",
  },
  {
    question: "Do you work with Salesforce?",
    answer:
      "Yes, Salesforce integrations are one of our core strengths. We connect Salesforce to your other tools and build automated workflows that keep your data in sync, trigger actions based on CRM events, and eliminate manual data entry.",
  },
  {
    question: "How long does it take to implement an automation?",
    answer:
      "Implementation timelines vary based on complexity. Simple automations can be deployed within 1-2 weeks, while more complex custom workflows may take 4-8 weeks. We'll provide a detailed timeline during our initial consultation.",
  },
  {
    question: "What tools do you use to build automations?",
    answer:
      "We primarily use n8n for building workflows, along with direct API integrations. We also work with Zapier, Make, and other platforms depending on your existing tech stack and specific requirements.",
  },
  {
    question: "What kind of ROI can I expect?",
    answer:
      "Most of our clients see significant ROI within the first 3 months. Automation typically reduces operational costs by 40-60% while freeing up your team to focus on higher-value work. We'll help you track and measure the impact of every automation we build.",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-[18px] pt-2">
            <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }
  return (
    <section className="w-full pt-10 md:pt-[66px] pb-12 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[250px] h-[400px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[60px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-2xl md:text-4xl font-semibold leading-tight md:leading-10 break-words">
            Frequently Asked Questions
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-xs md:text-sm font-medium leading-relaxed break-words">
            Everything you need to know about workflow automation and how it can streamline your operations
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}
