import { useContext } from "react";
import cn from "classnames";
import { useQuery } from "@tanstack/react-query";
import { AppContext } from "../../shared/context/app-context";
import type { ShibaType, ShibaUser } from "../../shared/types";
import { supabase } from "../../shared/api/supabase-сlient";
import stls from "../siba/siba.module.sass";
import { LayoutPage, ProgressBar } from "../../shared/ui";
import { IconCafe, IconGroomer, IconPark, IconPeople, IconTg } from "../../shared/icons";

type SibaProps = {
  id: string;
};

export const Siba = ({ id }: SibaProps) => {
  const { sibaIns } = useContext(AppContext);

  const siba = sibaIns.find((el: ShibaType) => el.id == id);

  const { data: sibaUser } = useQuery<ShibaUser | undefined>({
    queryKey: ["public-profile", siba?.siba_user_id ?? "unknown"],
    enabled: Boolean(siba?.siba_user_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("user_id, nickname, tgname, is_show_tgname")
        .eq("user_id", siba?.siba_user_id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data as ShibaUser | null) ?? undefined;
    },
  });

  return (
    <LayoutPage>
      <div className={stls.profileContainer}>
        <div className={stls.sibaInfoContainer}>
          <div
            className={cn(stls.avatarFrame, {
              [stls.wantToWalk]: siba?.want_to_walk,
            })}
          >
            <img
              className={stls.avatarImage}
              src={siba?.photos ?? `/${siba?.siba_icon}.png`}
              alt="Сиба"
            />
          </div>
          <h1 className={stls.sibaName}>{siba?.siba_name}</h1>
          <div className={stls.statsRow}>
            <span className={stls.mutedText}>
              {siba?.siba_gender === "male" ? "Мальчик" : "Девочка"}
            </span>
            <span className={stls.mutedText}>level: {siba?.level ?? 0}</span>
          </div>
          <div className={stls.statsRow}>
            <span>Подписки: {siba?.followers ?? 0}</span>{" "}
            <span>Подписчики: {siba?.followings ?? 0}</span>
          </div>
        </div>
        <div className={stls.ownerCard}>
          <div className={stls.ownerMain}>
            <IconPeople /> {sibaUser?.nickname}
          </div>
          <div className={stls.ownerInfo}>
            <IconTg />
            {sibaUser?.is_show_tgname ? sibaUser?.tgname : "Информация скрыта"}
          </div>
        </div>
        <div className={stls.achievements}>
          Достижения
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconCafe />
              <p>Кафе</p>
            </div>
            <ProgressBar value={siba?.cafe ?? 0} color="#7A7B7B" />
            <span>{((siba?.cafe ?? 0) / 20) * 100}%</span>
          </div>
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconPark />
              <p>Парки </p>
            </div>{" "}
            <ProgressBar value={siba?.park ?? 0} color="#2BB26E" />
            <span>{((siba?.park ?? 0) / 20) * 100}%</span>
          </div>
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconGroomer />
              <p>Грумер </p>
            </div>
            <ProgressBar value={siba?.groomer ?? 0} color="#333944" />
            <span>{((siba?.groomer ?? 0) / 20) * 100}%</span>
          </div>
        </div>
      </div>
    </LayoutPage>
  );
};
