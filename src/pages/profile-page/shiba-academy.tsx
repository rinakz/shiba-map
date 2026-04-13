import { useMemo, useState } from "react";
import { Drawer } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../shared/ui";
import { supabase } from "../../shared/api/supabase-сlient";
import stls from "./shiba-academy.module.sass";
import {
  getShibaRank,
  shibaSkills,
  SKILL_TABS,
  type SkillLevel,
} from "./shiba-academy.data";
import { profileQueryKeys } from "./profile.utils";

type Row = {
  siba_id: string;
  learned_skill_ids: string[] | null;
};

type ShibaAcademyProps = {
  sibaId?: string;
};

export const ShibaAcademy = ({ sibaId }: ShibaAcademyProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SkillLevel>("Base");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const progressQuery = useQuery<Row | null>({
    queryKey: ["siba-academy", sibaId],
    enabled: Boolean(sibaId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_academy_progress")
        .select("siba_id,learned_skill_ids")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as Row | null) ?? null;
    },
  });

  const learnedIds = useMemo(
    () => new Set(progressQuery.data?.learned_skill_ids ?? []),
    [progressQuery.data?.learned_skill_ids],
  );

  const saveMutation = useMutation({
    mutationFn: async (nextIds: string[]) => {
      if (!sibaId) return;
      const payload = { siba_id: sibaId, learned_skill_ids: nextIds };
      const { error } = await supabase
        .from("siba_academy_progress")
        .upsert(payload, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onMutate: async (nextIds: string[]) => {
      if (!sibaId) return;
      // Синхронно обновляем кэш, чтобы ранг в профиле под аватаркой не отставал.
      queryClient.setQueryData(["siba-academy", sibaId], {
        siba_id: sibaId,
        learned_skill_ids: nextIds,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["siba-academy", sibaId] });
      await queryClient.refetchQueries({ queryKey: ["siba-academy", sibaId] });
      await queryClient.invalidateQueries({ queryKey: ["mySiba"] });
      await queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.allSibas() });
    },
  });

  const filteredSkills = shibaSkills.filter((s) => s.level === activeTab);
  const completedCount = learnedIds.size;
  const status = getShibaRank(completedCount);
  const currentRank = status.rank;
  const progressPercent = (completedCount / shibaSkills.length) * 100;
  const selectedSkill = shibaSkills.find((s) => s.id === selectedSkillId) ?? null;

  const toggleSkill = async (skillId: string) => {
    const next = new Set(learnedIds);
    if (next.has(skillId)) next.delete(skillId);
    else next.add(skillId);
    await saveMutation.mutateAsync(Array.from(next));
    setSelectedSkillId(null);
  };

  if (progressQuery.isLoading && !progressQuery.data) {
    return (
      <div className={stls.root}>
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={42} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={220} />
      </div>
    );
  }

  return (
    <div className={stls.root}>
      <div className={stls.header}>
        <div className={stls.headerTop}>
          <span className={stls.headerTitle}>Академия Сиб</span>
          <span
            key={currentRank?.id ?? "no-rank"}
            className={`${stls.status} ${stls.statusRankUp}`}
          >
            {currentRank ? `${currentRank.icon} ${currentRank.rank}` : "Ранг еще не присвоен"}
          </span>
        </div>
        <div className={stls.progressTrack}>
          <div className={stls.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={stls.meta}>
          Выучено {completedCount} из {shibaSkills.length} • {status.percent}%
        </div>
        <div className={stls.rankQuote}>
          {currentRank
            ? currentRank.bossQuote
            : "Выучи первую команду, чтобы получить первый ранг."}
        </div>
      </div>

      <div className={stls.tabs}>
        {SKILL_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${stls.tab} ${activeTab === tab.key ? stls.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className={stls.grid}>
        {filteredSkills.map((skill) => {
          const checked = learnedIds.has(skill.id);
          return (
            <button
              key={skill.id}
              type="button"
              className={`${stls.card} ${checked ? stls.cardChecked : ""}`}
              onClick={() => setSelectedSkillId(skill.id)}
            >
              <div className={stls.cardIcon}>{skill.icon}</div>
              <div className={stls.cardName}>{skill.name}</div>
              <div className={stls.cardDesc}>{skill.desc}</div>
            </button>
          );
        })}
      </div>

      <Drawer
        anchor="bottom"
        open={Boolean(selectedSkill)}
        onClose={() => setSelectedSkillId(null)}
        PaperProps={{
          sx: {
            height: "auto",
            maxHeight: "86vh",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        {selectedSkill && (
          <div className={stls.drawerContent}>
            <div className={stls.drawerIcon}>{selectedSkill.icon}</div>
            <h3 className={stls.drawerTitle}>{selectedSkill.name}</h3>
            <p className={stls.drawerText}>{selectedSkill.desc}</p>
            <div className={stls.tip}>
              <div className={stls.tipTitle}>💡 Сиба-Лайфхак</div>
              <div className={stls.tipText}>{selectedSkill.tip}</div>
            </div>
            <Button
              onClick={() => toggleSkill(selectedSkill.id)}
              loading={saveMutation.isPending}
              disabled={saveMutation.isPending || !sibaId}
            >
              Мы выучили это!
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

