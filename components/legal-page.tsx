export const LegalPage = ({
  title,
  updated = "August 2026",
  sections,
}: {
  title: string;
  updated?: string;
  sections: { heading: string; body: string[] }[];
}) => (
  <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
    <p className="section-label">Legal</p>
    <h1 className="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
    <p className="mt-3 text-sm text-zinc-500">Last updated: {updated}</p>
    <div className="mt-10 space-y-8">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-lg font-semibold text-white">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-relaxed text-zinc-400">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  </div>
);
