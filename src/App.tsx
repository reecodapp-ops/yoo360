import Nav from "./sections/Nav";
import Hero from "./sections/Hero";
import Marquee from "./sections/Marquee";
import Services from "./sections/Services";
import Work from "./sections/Work";
import Impact from "./sections/Impact";
import Clients from "./sections/Clients";
import Story from "./sections/Story";
import Footer from "./sections/Footer";

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Work />
        <Impact />
        <Clients />
        <Story />
      </main>
      <Footer />
    </div>
  );
}
