import { HeroSection } from '@/components/landing/HeroSection'
import { SectionCardsGrid } from '@/components/landing/SectionCardsGrid'
import { CountdownWidget } from '@/components/landing/CountdownWidget'
import { Testimonials } from '@/components/landing/Testimonials'

export default function Landing() {
  return (
    <>
      <HeroSection />
      <SectionCardsGrid />
      <CountdownWidget />
      <Testimonials />
    </>
  )
}
