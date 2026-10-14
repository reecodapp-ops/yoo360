import { renderToStaticMarkup } from "react-dom/server";
import { AnimatePresence } from "framer-motion";
import App from "./App";
import ProjectEnquiry from "./pages/ProjectEnquiry";
import About from './pages/About';
import Service from './pages/Service';
import Partnerships from './pages/Partnerships';
import { servicePages, servicePath, partnershipPlans, planPath } from './lib/services';
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import TeamProfile from "./pages/TeamProfile";
import { teamMembers, teamMemberPath } from "./lib/team";

export { teamMembers, servicePages, partnershipPlans };
export { subscriptionMessage, subscriptionLink } from './lib/subscription';

// Build readable HTML for crawlers and visitors before JavaScript loads.
// The browser keeps the original React entry and its existing animations.
export function renderPage(path: string, search?: string) {
  const member = teamMembers.find(person => teamMemberPath(person) === path);
  const service = servicePages.find(item => servicePath(item) === path);
  const plan = partnershipPlans.find(item => planPath(item) === path);
  const page = path === "/" ? <App /> : path === "/discuss-a-project" ? <ProjectEnquiry search={search} /> : path === "/about" ? <About /> : path === "/team" ? <Team /> : member ? <TeamProfile member={member} /> : path === "/marketing-partnerships" ? <Partnerships /> : plan ? <Partnerships plan={plan} /> : service ? <Service service={service} /> : <NotFound />;
  return renderToStaticMarkup(<AnimatePresence initial={false}>{page}</AnimatePresence>);
}
