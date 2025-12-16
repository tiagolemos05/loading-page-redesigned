"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(
        "https://n8n.srv837090.hstgr.cloud/webhook/d03bdcd6-4559-42bc-bdca-36a0822edfa6",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        setIsSuccess(true)
        setFormData({ name: "", email: "", phone: "", company: "", message: "" })
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <section className="w-full px-5 py-16 md:py-24 relative contain-content">
      {/* Wave separator with glow */}
      <div className="absolute top-0 left-0 right-0 h-[200px] overflow-hidden">
        {/* Wave shape - solid background */}
        <div 
          className="absolute top-0 left-0 right-0 h-[100px] z-20"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0 0v4c250 0 250 96 500 96S750 4 1000 4V0H0Z" fill="%230f1211"></path></svg>')`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Subtle edge highlight - only visible in center */}
        <div 
          className="absolute top-0 left-0 right-0 h-[100px] z-30 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none"><defs><linearGradient id="fadeGrad" x1="0%25" y1="0%25" x2="100%25" y2="0%25"><stop offset="0%25" stop-color="white" stop-opacity="0"/><stop offset="35%25" stop-color="white" stop-opacity="0.15"/><stop offset="50%25" stop-color="white" stop-opacity="0.2"/><stop offset="65%25" stop-color="white" stop-opacity="0.15"/><stop offset="100%25" stop-color="white" stop-opacity="0"/></linearGradient></defs><path d="M0 4c250 0 250 96 500 96S750 4 1000 4" fill="none" stroke="url(%23fadeGrad)" stroke-width="1"></path></svg>')`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Glow - clipped by overflow hidden, positioned to only show below wave */}
        <div 
          className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[800px] h-[90px] opacity-20 blur-[50px] z-10"
          style={{
            background: 'radial-gradient(ellipse at center top, hsl(var(--primary)) 0%, transparent 65%)',
          }}
        />
      </div>

      <div className="max-w-[600px] mx-auto pt-[80px]">
        <div className="text-center mb-10">
          <h2 className="text-foreground text-4xl md:text-5xl font-semibold mb-4">
            Ready to Automate your Business?
          </h2>
          <p className="text-muted-foreground text-lg">
            Tell us about your project and we'll show you what's possible.
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/20 p-8 relative overflow-hidden bg-[rgba(20,20,22,0.9)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

          {isSuccess ? (
            <div className="relative z-10 text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-foreground text-xl font-semibold mb-2">
                Message Sent Successfully!
              </h3>
              <p className="text-muted-foreground">
                We appreciate your interest and will be in touch within 24 hours.
              </p>
              <Button
                onClick={() => setIsSuccess(false)}
                className="mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name *"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <textarea
                name="message"
                placeholder="Tell us about your project..."
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-3 rounded-full font-medium text-base shadow-lg ring-1 ring-white/10 disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
