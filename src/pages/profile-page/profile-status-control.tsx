import { useEffect, useRef, useState } from "react";
import { Popover } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { SibaToast } from "../../shared/ui";
import { getSibaStatus, getSibaStatusColor, SHIBA_STATUSES } from "../../shared/utils/siba-status";
import type { SibaStatus, ShibaType } from "../../shared/types";
import { profileQueryKeys, setSibaStatus } from "./profile.utils";
import stls from "./profile.module.sass";

type Props = {
  mySiba?: ShibaType;
  authUserId?: string | null;
  isEdit: boolean;
  setError: (value: string | null) => void;
  setMySiba: React.Dispatch<React.SetStateAction<ShibaType | undefined>>;
  setSibaIns: React.Dispatch<React.SetStateAction<ShibaType[]>>;
};

export const ProfileStatusControl = ({
  mySiba,
  authUserId,
  isEdit,
  setError,
  setMySiba,
  setSibaIns,
}: Props) => {
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState<HTMLElement | null>(null);
  const statusTimerRef = useRef<number | null>(null);
  const currentStatus = mySiba ? getSibaStatus(mySiba) : null;

  const handleSetStatus = async (nextStatus: SibaStatus | null) => {
    if (!mySiba?.id || isUpdatingStatus) return;
    setIsUpdatingStatus(true);

    try {
      await setSibaStatus(mySiba, nextStatus, setError, setMySiba);
      setSibaIns((prev) =>
        prev.map((s) =>
          s.id === mySiba.id
            ? { ...s, status: nextStatus, want_to_walk: nextStatus === "walk" }
            : s,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.allSibas() });
      if (authUserId) {
        await queryClient.invalidateQueries({
          queryKey: profileQueryKeys.mySiba(authUserId),
        });
      }
      setStatusAnchorEl(null);
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);

      if (nextStatus) {
        const untilTs = Date.now() + 2 * 60 * 60 * 1000;
        localStorage.setItem(`siba-status-until:${mySiba.id}`, String(untilTs));
        statusTimerRef.current = window.setTimeout(() => {
          setSibaStatus(
            { ...mySiba, status: nextStatus, want_to_walk: nextStatus === "walk" },
            null,
            setError,
            setMySiba,
          );
          localStorage.removeItem(`siba-status-until:${mySiba.id}`);
        }, 2 * 60 * 60 * 1000);
        setStatusToast(
          `Статус обновлен! Теперь соседи на карте видят, что вы ${SHIBA_STATUSES.find((s) => s.id === nextStatus)?.label}.`,
        );
      } else {
        localStorage.removeItem(`siba-status-until:${mySiba.id}`);
        setStatusToast("Статус очищен.");
      }

      window.setTimeout(() => setStatusToast(null), 2200);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (!mySiba?.id) return;
    const raw = localStorage.getItem(`siba-status-until:${mySiba.id}`);
    if (!raw) return;
    const until = Number(raw);
    if (!Number.isFinite(until)) return;
    const left = until - Date.now();
    if (left <= 0) {
      setSibaStatus(mySiba, null, setError, setMySiba);
      localStorage.removeItem(`siba-status-until:${mySiba.id}`);
      return;
    }
    statusTimerRef.current = window.setTimeout(() => {
      setSibaStatus(mySiba, null, setError, setMySiba);
      localStorage.removeItem(`siba-status-until:${mySiba.id}`);
    }, left);
    return () => {
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    };
  }, [mySiba?.id]);

  if (isEdit) return <SibaToast text={statusToast} />;

  return (
    <>
      {currentStatus ? (
        <button
          type="button"
          className={stls.statusCapsule}
          onClick={(e) => setStatusAnchorEl(e.currentTarget)}
          style={{ borderColor: getSibaStatusColor(currentStatus) }}
        >
          <span
            className={stls.statusDot}
            style={{ backgroundColor: getSibaStatusColor(currentStatus) }}
          />
          {SHIBA_STATUSES.find((s) => s.id === currentStatus)?.label}
        </button>
      ) : (
        <button
          type="button"
          className={stls.statusCapsule}
          onClick={(e) => setStatusAnchorEl(e.currentTarget)}
        >
          Поставить статус
        </button>
      )}
      <Popover
        open={Boolean(statusAnchorEl)}
        anchorEl={statusAnchorEl}
        onClose={() => setStatusAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <div className={stls.statusMenu}>
          {SHIBA_STATUSES.filter((s) => s.id !== currentStatus).map((status) => (
            <button
              key={status.id}
              type="button"
              className={stls.statusMenuItem}
              onClick={() => handleSetStatus(status.id)}
            >
              <span
                className={stls.statusDot}
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </button>
          ))}
          {currentStatus && (
            <button
              type="button"
              className={stls.statusMenuItem}
              onClick={() => handleSetStatus(null)}
            >
              Очистить статус
            </button>
          )}
        </div>
      </Popover>
      <SibaToast text={statusToast} />
    </>
  );
};

