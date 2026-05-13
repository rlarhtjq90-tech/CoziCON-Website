import GNB from '@/components/layout/GNB'
import Footer from '@/components/layout/Footer'
import Process from '@/components/sections/Process'
import DualAudience from '@/components/sections/DualAudience'
import Features from '@/components/sections/Features'
import WorkTypeSection from '@/components/sections/WorkTypeSection'
import Statistics from '@/components/sections/Statistics'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'

export default function HomePage() {
  return (
    <>
      <GNB />
      <main>
        <WorkTypeSection />
        <Process />
        <DualAudience />
        <Features />
        <Statistics />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
