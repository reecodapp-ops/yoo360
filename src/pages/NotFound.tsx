import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Nav from "@/sections/Nav";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found | Yoo360";
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content = "noindex, follow";
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelectorAll('script[type="application/ld+json"]').forEach(node => node.remove());
  }, []);

  return (
    <div className="min-h-screen">
      <Nav projectPage />
      <main className="mx-auto max-w-7xl px-5 pt-40 pb-20 md:px-10">
        <p className="mb-5 text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/50">404</p>
        <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">Page not found.</h1>
        <p className="mt-6 text-[#131311]/65">This page may have moved. Let’s get you back to Yoo360.</p>
        <a href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#131311] px-7 py-3.5 text-sm font-semibold text-[#F6F4EE] transition-colors hover:bg-[#FFC700] hover:text-[#131311]">
          <ArrowLeft className="size-4" /> Back to Yoo360
        </a>
      </main>
    </div>
  );
}
