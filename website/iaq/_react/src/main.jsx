import React, { lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Shell from './components/Shell.jsx'
import './styles/base.css'

const Home = lazy(() => import('./pages/Home.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'))
const Careers = lazy(() => import('./pages/Careers.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    /* jump instantly through Lenis when it is driving the scroll, so scroll-linked
       animations on the new page start from a true zero instead of a mid-lerp value */
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* survive Vite HMR of this entry module: reuse the root instead of re-creating it */
const container = document.getElementById('root')
const root = container.__reactRoot || (container.__reactRoot = createRoot(container))
root.render(
  <BrowserRouter>
    <ScrollToTop />
    <Shell>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </Shell>
  </BrowserRouter>
)
