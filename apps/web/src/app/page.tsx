const panels = [
  {
    title: "Frontend",
    body: "Next.js 15 App Router lives in apps/web and is ready for UI work."
  },
  {
    title: "API",
    body: "NestJS serves /health so you can verify the backend is wired and running."
  },
  {
    title: "Database",
    body: "Prisma schema is isolated in packages/database for shared data access later."
  }
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Pulsebook Monorepo</p>
        <h1 className="title">Track the signal.</h1>
        <p className="lede">
          This starter pairs a Next.js 15 frontend with a NestJS API and a
          Prisma workspace package so you can grow product, endpoints, and data
          modeling together.
        </p>
        <div className="panel-grid">
          {panels.map((panel) => (
            <article className="panel" key={panel.title}>
              <h2>{panel.title}</h2>
              <p>{panel.body}</p>
            </article>
          ))}
        </div>
        <span className="code">GET http://localhost:3001/api/health</span>
      </section>
    </main>
  );
}
