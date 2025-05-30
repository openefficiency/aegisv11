import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Mic, Lock, Coins, TrendingUp, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { VapiVoiceWidget } from "@/components/vapi-voice-widget"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">AegisWhistle</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/follow-up">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Follow-up
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                  Team Aegis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
            🛡️ Speak Safely. Be Heard. Change Everything.
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The World's First <span className="text-blue-400">Blockchain-Anchored</span>
            <br />
            AI-Powered Whistleblowing Platform
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            AegisWhistle protects whistleblowers, automates investigations, and rewards courage—anonymously.
            Military-grade security meets AI-driven justice.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/report">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Start Your Secure Report
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Voice AI Demo */}
          <div className="mb-16">
            <VapiVoiceWidget />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">72%</div>
              <div className="text-slate-400">Face Retaliation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">94%</div>
              <div className="text-slate-400">AI Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">15%</div>
              <div className="text-slate-400">Reward Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">100%</div>
              <div className="text-slate-400">Anonymity Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Silence Costs Trillions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-red-400 mb-2">72%</div>
                  <p className="text-slate-300">Face retaliation (Deloitte, 2023)</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-400 mb-2">63%</div>
                  <p className="text-slate-300">Fraud exposed by tips but most go unreported (ACFE)</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-xl text-slate-400 mt-8">
              Legacy systems leak identities, delay justice, let fraudsters win
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your Voice. <span className="text-blue-400">Unsilenced.</span>
            </h2>
            <p className="text-xl text-slate-300 mb-12">AegisWhistle combines:</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Lock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Military-grade anonymity</h3>
                <p className="text-slate-400">Tor networks + zero-knowledge proofs</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 hover:border-green-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI-driven case triage</h3>
                <p className="text-slate-400">94% fraud detection accuracy</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Blockchain-sealed evidence</h3>
                <p className="text-slate-400">Tamper-proof Hyperledger + IPFS</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Coins className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Untraceable crypto rewards</h3>
                <p className="text-slate-400">Crypto payouts post-investigation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Report Anonymously</h3>
              <p className="text-slate-400">
                Share what you know—no name, email, or trace. Optional: Upload documents, photos, or recordings securely
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Guardian Takes Over</h3>
              <p className="text-slate-400">Our NLP analyzes patterns; Agentic AI prioritizes high-risk cases.</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Justice in Motion</h3>
              <p className="text-slate-400">
                Track progress via anonymized updates. Earn rewards if funds are recovered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Features</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <Mic className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aegis AI Assistant</h3>
                <p className="text-slate-400">Your 24/7 trauma-informed guide.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <Shield className="h-8 w-8 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Immutable Evidence Log</h3>
                <p className="text-slate-400">Court-ready documentation.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <Coins className="h-8 w-8 text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Crypto Rewards</h3>
                <p className="text-slate-400">Up to 15% of recovered assets (paid in Crypto).</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Global Compliance</h3>
                <p className="text-slate-400">GDPR, HIPAA, DOJ-ready.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Founder's Note</h2>
          <blockquote className="text-lg text-slate-300 italic mb-4">
            "I sold my house to build RegTech systems. I've been a whistleblower myself. Know the impact of mobbing, gas
            lighting. After FixNix was copied and my second startup failed, AegisWhistle is my redemption—a system that
            can't be silenced."
          </blockquote>
          <p className="text-blue-400 font-semibold">– Shan Sankaran, Founder</p>
        </div>
      </section>

      {/* Pilot Spotlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pilot Spotlight: <span className="text-blue-400">LA Metro</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8">Stopping the Third Scandal</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">40%</div>
              <div className="text-slate-400">Faster evidence analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">12</div>
              <div className="text-slate-400">High-risk anomalies in Phase 1</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">100%</div>
              <div className="text-slate-400">Anonymity guaranteed</div>
            </div>
            <Link href="/report">
              <Button className="bg-blue-600 hover:bg-blue-700">Support Our Pilot</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            The next Enron is brewing. Will you shield it—or expose it?
          </h2>
          <Link href="/report">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-slate-100 px-8 py-4 text-lg font-semibold">
              Begin Your Report
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold text-white">AegisWhistle</span>
              </div>
              <p className="text-slate-400">Protecting whistleblowers, automating investigations, rewarding courage.</p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a
                    href="https://www.eff.org/issues/whistleblowers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Safety Resources
                  </a>
                </li>
                <li>
                  <a
                    href="https://whistlebloweraid.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Legal Armor
                  </a>
                </li>
                <li>
                  <a
                    href="https://openefficiency.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Partners & Technology</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="https://www.eff.org" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    🔐 Electronic Frontier Foundation
                  </a>
                </li>
                <li>
                  <a
                    href="https://whistlebloweraid.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    ⚖️ Whistleblower Aid
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.hyperledger.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    🔗 Hyperledger Foundation
                  </a>
                </li>
                <li>
                  <a
                    href="https://openefficiency.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    ⚡ OpenEfficiency.org (Blockchain)
                  </a>
                </li>
              </ul>
              <p className="text-slate-400 mt-4 text-sm">© 2025 AegisWhistle. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
