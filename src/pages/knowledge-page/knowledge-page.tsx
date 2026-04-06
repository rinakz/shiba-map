import { useMemo, useState } from "react";
import { Input } from "../../shared/ui";
import stls from "./knowledge-page.module.sass";
import { KNOWLEDGE_TOPICS } from "./knowledge-page.data";
import { WikiArticle } from "./wiki-article";

const normalize = (value: string) =>
  value.toLowerCase().replace(/ё/g, "е").trim();

export const KnowledgePage = () => {
  const [query, setQuery] = useState("");
  const [openTopic, setOpenTopic] = useState<string | null>(KNOWLEDGE_TOPICS[0]?.title ?? null);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return KNOWLEDGE_TOPICS;
    return KNOWLEDGE_TOPICS.filter((topic) => {
      const inTitle = normalize(topic.title).includes(q) || normalize(topic.subtitle).includes(q);
      const inSub = topic.subtopics.some((s) => {
        const inTitle = normalize(s.title).includes(q);
        const inBody = s.body.some((p) => normalize(p).includes(q));
        return inTitle || inBody;
      });
      return inTitle || inSub;
    });
  }, [query]);

  return (
    <div className={stls.page}>
      <div className={stls.search}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по темам и подтемам"
        />
      </div>
      {filtered.map((topic) => {
        const isOpen = openTopic === topic.title;
        return (
          <div key={topic.title} className={stls.card}>
            <button
              type="button"
              className={stls.head}
              onClick={() => setOpenTopic((prev) => (prev === topic.title ? null : topic.title))}
            >
              <div>
                <div className={stls.title}>{topic.title}</div>
                <div className={stls.subtitle}>{topic.subtitle}</div>
              </div>
              <span>{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className={stls.body}>
                {topic.subtopics.map((sub) => (
                  <WikiArticle key={sub.id} topicId={topic.id} article={sub} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

