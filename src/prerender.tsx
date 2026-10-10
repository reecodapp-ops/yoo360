import { renderToStaticMarkup } from "react-dom/server";
import { AnimatePresence } from "framer-motion";
import App from "./App";
import ProjectEnquiry from "./pages/ProjectEnquiry";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import TeamProfile from "./pages/TeamProfile";
import { teamMembers, teamMemberPath } from "./lib/team";

export { teamMembers };

// Build readable HTML for crawlers and visitors before JavaScript loads.
// The browser keeps the original React entry and its existing animations.
export function renderPage(path: string) {
  const member = teamMembers.find(person => teamMemberPath(person) === path);
  const page = path === "/" ? <App /> : path === "/discuss-a-project" ? <ProjectEnquiry /> : path === "/team" ? <Team /> : member ? <TeamProfile member={member} /> : <NotFound />;
  return renderToStaticMarkup(<AnimatePresence initial={false}>{page}</AnimatePresence>);
}
