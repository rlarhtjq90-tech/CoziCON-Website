import GNB from '@/components/layout/GNB'
import Footer from '@/components/layout/Footer'
import Process from '@/components/sections/Process'
import DualAudience from '@/components/sections/DualAudience'
import VerifySection from '@/components/sections/VerifySection'
import Features from '@/components/sections/Features'
import WorkTypeSection from '@/components/sections/WorkTypeSection'
import Statistics from '@/components/sections/Statistics'
import FinalCTA from '@/components/sections/FinalCTA'
import SignupStart from '@/components/sections/SignupStart'

export default function HomePage() {
  return (
    <>
      <GNB />
      <main>
        <WorkTypeSection />
        <SignupStart />
        <Process />
        <DualAudience />
        <VerifySection />
        <Features />
        <Statistics />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
