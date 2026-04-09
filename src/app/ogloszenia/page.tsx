import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function OgloszeniaPage() {
  const list = await prisma.announcement.findMany({
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true, login: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Ogłoszenia</h1>
      {list.length === 0 ? (
        <p className="text-emerald-950/70">Brak ogłoszeń.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((a) => (
            <li key={a.id} className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">{a.title}</h2>
              <p className="mt-1 text-xs text-emerald-800/60">
                {a.publishedAt.toLocaleString("pl-PL")}
                {a.author ? ` · ${a.author.name ?? a.author.login}` : ""}
              </p>
              <article className="prose prose-sm mt-3 max-w-none prose-headings:text-emerald-950 prose-p:text-emerald-950 prose-li:text-emerald-950">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body}</ReactMarkdown>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
