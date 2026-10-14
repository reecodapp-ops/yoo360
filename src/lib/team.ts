export type TeamMember = {
  slug: string;
  name: string;
  fullName?: string;
  metaDescription: string;
  role: string;
  bio: string;
  initials: string;
  portrait: string | null;
  portraitPosition?: string;
  connections: { platform: "Instagram" | "LinkedIn" | "Website"; url: string }[];
};

export const teamMembers: TeamMember[] = [
  {
    slug: "melkisedeck-ruposo",
    name: "Melkisedeck Ruposo",
    metaDescription: "Meet Melkisedeck Ruposo, Visual Designer at Yoo360, specializing in branding, visual identity, graphic design and motion design.",
    role: "Visual Designer",
    bio: "Specializing in branding, visual identity, and digital content creation. Melkisedeck brings brands to life through high impact motion design and graphic artistry.",
    initials: "MR",
    portrait: "/assets/team/melkisedeck-ruposo.webp",
    portraitPosition: "50% center",
    connections: [
      { platform: "Instagram", url: "https://www.instagram.com/mlkruposo/" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/melkisedeck-ruposo-813347368/" },
    ],
  },
  {
    slug: "berton-ruposo",
    name: "Berton Ruposo",
    fullName: "Berton Ruposo Mwisha",
    metaDescription: "Meet Berton Ruposo Mwisha, Creative Director and Co-Founder of Yoo360, leading brand strategy, visual identity and creative marketing.",
    role: "Creative Director & Co-Founder",
    bio: "Leading the creative vision and brand strategy for Yoo360. Berton oversees all visual identity projects, from large scale event branding to core graphic design, ensuring every output aligns with our standard of excellence.",
    initials: "BR",
    portrait: "/assets/team/berton-ruposo.jpg",
    connections: [
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/bertonruposo/" },
      { platform: "Website", url: "https://www.bertonruposo.com/" },
    ],
  },
  {
    slug: "bertin-victoire",
    name: "Bertin Victoire",
    metaDescription: "Meet Bertin Victoire, Director of Media and Operations at Yoo360, leading video production, content marketing and client operations.",
    role: "Director of Media & Operations",
    bio: "Bridging the gap between creative vision and market execution. Bertin leads our video production, content marketing, and client operations, ensuring every project is delivered with strategic impact.",
    initials: "BV",
    portrait: "/assets/team/bertin-victoire.jpg",
    connections: [
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/bertinvictoire/" },
      { platform: "Website", url: "https://bertin.cd/" },
    ],
  },
];

export const teamMemberPath = (member: TeamMember) => `/team/${member.slug}`;
