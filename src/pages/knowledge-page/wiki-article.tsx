import { useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/material";
import { IconChatDot } from "../../shared/icons";
import type { KnowledgeSubtopic } from "./knowledge-page.data";
import stls from "./knowledge-page.module.sass";

type Props = {
  topicId: string;
  article: KnowledgeSubtopic;
};

export const WikiArticle = ({ topicId, article }: Props) => {
  const articleAnchor = `${topicId}-${article.id}`;
  const storageKey = `wiki-checklist:${articleAnchor}`;
  const [checked, setChecked] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
    } catch {
      localStorage.removeItem(storageKey);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const progressPercent = useMemo(() => {
    const seed = article.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return 84 + (seed % 8);
  }, [article.id]);

  return (
    <div id={articleAnchor} className={stls.subtopic}>
      <Typography className={stls.subtopicTitle}>{article.title}</Typography>
      {article.body.map((paragraph) => (
        <Typography key={paragraph} className={stls.subtopicBody}>
          {paragraph}
        </Typography>
      ))}
      <div className={stls.warningBox}>
        <Typography className={stls.warningTitle}>Shiba-Sensei Warning ⚠️</Typography>
        <Typography className={stls.warningText}>{article.warning}</Typography>
      </div>
      {topicId === "psychology" && Boolean(article.checklist?.length) && (
        <div className={stls.checklistBox}>
          <Typography className={stls.checklistTitle}>Check-list: А как у вас?</Typography>
          <div className={stls.checklistItems}>
            {article.checklist?.map((question, idx) => {
              const active = checked.includes(idx);
              return (
                <label key={question} className={stls.checklistItem}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      setChecked((prev) =>
                        prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx],
                      )
                    }
                  />
                  <span>{question}</span>
                </label>
              );
            })}
          </div>
          {checked.length > 0 && (
            <Typography className={stls.checklistResult}>
              Ты не один! {progressPercent}% владельцев сиб проходят через это. Посмотри советы выше еще раз!
            </Typography>
          )}
        </div>
      )}
      <div className={stls.articleActions}>
        <div className={stls.chatHint}>
          <IconChatDot />
        </div>
      </div>
    </div>
  );
};

