import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import App from './App.tsx'
import ProjectEnquiry from './pages/ProjectEnquiry.tsx'
import About from './pages/About';
import Service from './pages/Service';
import Partnerships from './pages/Partnerships';
import { servicePages, servicePath, partnershipPlans, planPath } from './lib/services';
import NotFound from './pages/NotFound.tsx'
import Team from './pages/Team.tsx'
import TeamProfile from './pages/TeamProfile.tsx'
import { teamMembers, teamMemberPath } from './lib/team.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/discuss-a-project" element={<ProjectEnquiry />} />
        <Route path="/other-enquiry" element={<ProjectEnquiry other />} />
        <Route path="/marketing-partnerships" element={<Partnerships />} />
        {partnershipPlans.map(plan => <Route key={plan.slug} path={planPath(plan)} element={<Partnerships plan={plan} />} />)}
        {servicePages.map(service => <Route key={service.slug} path={servicePath(service)} element={<Service service={service} />} />)}
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        {teamMembers.map(member => <Route key={member.slug} path={teamMemberPath(member)} element={<TeamProfile member={member} />} />)}
        <Route path="/" element={<App />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
