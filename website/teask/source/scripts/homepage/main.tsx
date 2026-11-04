import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '../../src/index.css'
/* same side-effect layers the full site boots with: WebGL vignettes and the
   scroll-scrubbed delivery sequence, then nav hide-on-scroll and reveals */
import '../../src/lib/bmEnhance.js'
import '../../src/lib/bmChrome.js'
import AmbientParticles from '../../src/components/AmbientParticles'
import Navbar from '../../src/components/Navbar'
import Footer from '../../src/components/Footer'
import BackToTop from '../../src/components/BackToTop'
import LoginModal from '../../src/components/LoginModal'
import { AuthProvider } from '../../src/lib/auth'
import { SITE_URL } from '../../src/lib/seo'
import HomePage from '../../src/pages/HomePage'

/**
 * Homepage-only build (npm run build:homepage → homepage/).
 *
 * The same shell as src/App.tsx with every route but "/" removed. Only the
 * homepage ships in this folder, so a link to any other page (About, Contact,
 * legal, admin) is sent to the live site instead of a page that is not here.
 * Capture phase, so it runs before react-router's own click handling.
 */
document.addEventListener(
  'click',
  (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a || a.origin !== location.origin || a.pathname === '/' || a.pathname === '/index.html') return
    e.preventDefault()
    e.stopPropagation()
    location.href = SITE_URL + a.pathname + a.search + a.hash
  },
  true,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen w-full bg-paper text-navy-950 selection:bg-teal-brand/30">
          <AmbientParticles />
          <Navbar />
          <HomePage />
          <Footer />
          <BackToTop />
          <LoginModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
