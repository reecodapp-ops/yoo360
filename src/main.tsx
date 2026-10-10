import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import App from './App.tsx'
import ProjectEnquiry from './pages/ProjectEnquiry.tsx'
import NotFound from './pages/NotFound.tsx'
import Team from './pages/Team.tsx'
import TeamProfile from './pages/TeamProfile.tsx'
import { teamMembers, teamMemberPath } from './lib/team.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/discuss-a-project" element={<ProjectEnquiry />} />
        <Route path="/team" element={<Team />} />
        {teamMembers.map(member => <Route key={member.slug} path={teamMemberPath(member)} element={<TeamProfile member={member} />} />)}
        <Route path="/" element={<App />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
