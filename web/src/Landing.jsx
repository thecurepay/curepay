import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import PoweredBy from './components/PoweredBy'
import AgentSection from './components/AgentSection'
import CoinList from './components/CoinList'
import TokenCA from './components/TokenCA'
import Playground from './components/Playground'
import Vision from './components/Vision'
import Platform from './components/Platform'
import Capabilities from './components/Capabilities'
import HowItWorks from './components/HowItWorks'
import ScoreBreakdown from './components/ScoreBreakdown'
import ApiSection from './components/ApiSection'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'

export default function Landing() {
  return (
    <div className="grain">
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <TokenCA />
        <Marquee />
        <PoweredBy />
        <CoinList />
        <AgentSection />
        <Playground />
        <Vision />
        <Platform />
        <Capabilities />
        <HowItWorks />
        <ScoreBreakdown />
        <ApiSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
