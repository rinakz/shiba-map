import {
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { SwipeableDrawer, Dialog, useMediaQuery } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase-сlient";
import { assignUserToCommunity } from "../api/communities";
import {
  COMMUNITY_PREVIEW_LEADERBOARD_QK_COMMUNITIES,
  COMMUNITY_PREVIEW_LEADERBOARD_QK_MEMBERSHIPS,
  COMMUNITY_PREVIEW_MEMBER_FACE_COUNT,
  COMMUNITY_PREVIEW_MODAL_Z_INDEX,
  communityPreviewMembersListQueryKey,
} from "../constants/community-preview-drawer";
import type { CommunityPreviewOpenPayload } from "../types/community-preview-drawer.types";
import type { ShibaType } from "../types";
import {
  communityPreviewExternalLinkLabel,
  communityPreviewRuParticipantsWord,
  fetchCommunityMembersPreview,
} from "../utils/community-preview-drawer";
import { Button } from "../ui/button/button";
import { AppContext } from "./app-context";
import { CommunityPreviewDrawerContext } from "./community-preview-drawer-react-context";
import stls from "./community-preview-drawer.module.sass";

export function CommunityPreviewDrawerProvider({
  children,
}: PropsWithChildren) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { authUserId, mySiba, setMySiba } = useContext(AppContext);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<CommunityPreviewOpenPayload | null>(
    null,
  );
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [membersView, setMembersView] = useState<"home" | "list">("home");

  const communityId = payload?.communityId ?? null;

  const membersListQuery = useQuery({
    queryKey: communityId
      ? communityPreviewMembersListQueryKey(communityId)
      : ["community-members-list", "none"],
    enabled: Boolean(open && communityId),
    queryFn: () => fetchCommunityMembersPreview(communityId!),
  });

  const openCommunityPreview = useCallback(
    (next: CommunityPreviewOpenPayload) => {
      setJoinError(null);
      setMembersView("home");
      setPayload(next);
      setOpen(true);
    },
    [],
  );

  const closeCommunityPreview = useCallback(() => {
    setOpen(false);
    setPayload(null);
    setJoinError(null);
    setMembersView("home");
  }, []);

  const ctx = useMemo(
    () => ({ openCommunityPreview, closeCommunityPreview }),
    [openCommunityPreview, closeCommunityPreview],
  );

  const members = membersListQuery.data;
  const displayMembers = Array.isArray(members)
    ? members.length
    : typeof payload?.memberCount === "number"
      ? payload.memberCount
      : membersListQuery.isPending || membersListQuery.isFetching
        ? undefined
        : 0;

  const faceList = Array.isArray(members) ? members : [];
  const facePreview = faceList.slice(0, COMMUNITY_PREVIEW_MEMBER_FACE_COUNT);
  const extraFaces = Math.max(
    0,
    faceList.length - COMMUNITY_PREVIEW_MEMBER_FACE_COUNT,
  );

  const isAlreadyMember = Boolean(
    payload?.communityId && mySiba?.community_id === payload.communityId,
  );

  const handleJoin = async () => {
    if (!authUserId || !payload?.communityId) return;
    setJoinBusy(true);
    setJoinError(null);
    try {
      await assignUserToCommunity({
        authUserId,
        communityId: payload.communityId,
      });
      const { data, error } = await supabase
        .from("siba_map_markers")
        .select("*")
        .eq("siba_user_id", authUserId)
        .maybeSingle();
      if (error) throw error;
      if (data) setMySiba(data as ShibaType);
      await queryClient.invalidateQueries({
        queryKey: COMMUNITY_PREVIEW_LEADERBOARD_QK_MEMBERSHIPS,
      });
      await queryClient.invalidateQueries({
        queryKey: COMMUNITY_PREVIEW_LEADERBOARD_QK_COMMUNITIES,
      });
      await queryClient.invalidateQueries({
        queryKey: communityPreviewMembersListQueryKey(payload.communityId),
      });
      closeCommunityPreview();
    } catch (e) {
      setJoinError(
        e instanceof Error ? e.message : "Не удалось вступить в сообщество.",
      );
    } finally {
      setJoinBusy(false);
    }
  };

  const openMembersList = () => {
    if ((displayMembers ?? 0) > 0) setMembersView("list");
  };

  const homeBody =
    open && payload ? (
      <div className={stls.drawerBody}>
        <div className={stls.drawerHandle} />
        <h3 className={stls.drawerTitle}>{payload.title}</h3>
        <div className={stls.drawerAvatarWrap}>
          {payload.avatarUrl ? (
            <img
              className={stls.drawerAvatar}
              src={payload.avatarUrl}
              alt=""
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={stls.drawerAvatarPlaceholder} aria-hidden />
          )}
        </div>
        {communityId ? (
          <div className={stls.membersBlock}>
            {membersListQuery.isError ? (
              <div className={stls.drawerMeta}>
                Не удалось загрузить участников.
              </div>
            ) : membersListQuery.isPending ? (
              <div className={stls.drawerMeta}>
                <span>Участников: …</span>
              </div>
            ) : (
              <>
                {facePreview.length > 0 ? (
                  <button
                    type="button"
                    className={stls.memberFacesButton}
                    onClick={openMembersList}
                    aria-label="Показать всех участников"
                  >
                    <div className={stls.memberFacesStack}>
                      {facePreview.map((m, i) => (
                        <img
                          key={m.user_id}
                          className={stls.memberFace}
                          src={m.avatar_src}
                          alt=""
                          style={{ zIndex: i + 1 }}
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                      {extraFaces > 0 ? (
                        <span
                          className={stls.memberFaceMore}
                          aria-hidden
                          style={{ zIndex: facePreview.length + 1 }}
                        >
                          +{extraFaces}
                        </span>
                      ) : null}
                    </div>
                  </button>
                ) : null}
                <button
                  type="button"
                  className={stls.membersCountButton}
                  onClick={openMembersList}
                  disabled={(displayMembers ?? 0) === 0}
                >
                  {displayMembers === undefined ? (
                    "Участников: …"
                  ) : (
                    <>
                      Участников: <strong>{displayMembers}</strong>
                      {(displayMembers ?? 0) > 0 ? (
                        <span className={stls.membersCountChevron}> · все</span>
                      ) : null}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        ) : null}
        {payload.externalLink ? (
          <Button
            size="medium"
            variant="secondary"
            className={stls.drawerBtn}
            onClick={() => {
              window.open(payload.externalLink!, "_blank", "noopener,noreferrer");
            }}
          >
            {communityPreviewExternalLinkLabel(payload.externalLink)}
          </Button>
        ) : null}
        {payload.communityId ? (
          isAlreadyMember ? (
            <p className={stls.drawerHint}>Вы уже в этой стае в Сибинаторе.</p>
          ) : (
            <>
              <Button
                size="medium"
                className={stls.drawerBtn}
                loading={joinBusy}
                disabled={!authUserId || joinBusy}
                onClick={() => void handleJoin()}
              >
                Вступить в Сибинаторе
              </Button>
              {!authUserId ? (
                <p className={stls.drawerHint}>Войдите, чтобы вступить в стаю.</p>
              ) : null}
            </>
          )
        ) : (
          <p className={stls.drawerHintMuted}>
            Вступить в приложении можно только для сообществ из каталога
            Сибинатора.
          </p>
        )}
        {joinError ? <p className={stls.drawerErr}>{joinError}</p> : null}
        <Button
          type="button"
          size="small"
          variant="secondary"
          className={stls.drawerClose}
          onClick={closeCommunityPreview}
        >
          Закрыть
        </Button>
      </div>
    ) : null;

  const listBody =
    open && payload ? (
      <div className={stls.drawerBody}>
        <div className={stls.drawerHandle} />
        <button
          type="button"
          className={stls.memberListBack}
          onClick={() => setMembersView("home")}
        >
          ← Назад
        </button>
        <h3 className={stls.drawerTitle}>Участники · {payload.title}</h3>
        <p className={stls.memberListSub}>
          {faceList.length}{" "}
          {communityPreviewRuParticipantsWord(faceList.length)}
        </p>
        <div className={stls.memberListScroll}>
          {faceList.map((m) => (
            <div key={m.user_id} className={stls.memberListRow}>
              <img
                className={stls.memberListAvatar}
                src={m.avatar_src}
                alt=""
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <span className={stls.memberListName}>{m.display_name}</span>
            </div>
          ))}
        </div>
        <Button
          type="button"
          size="small"
          variant="secondary"
          className={stls.drawerClose}
          onClick={closeCommunityPreview}
        >
          Закрыть
        </Button>
      </div>
    ) : null;

  const body =
    open && payload && membersView === "list" ? listBody : homeBody;

  return (
    <CommunityPreviewDrawerContext.Provider value={ctx}>
      {children}
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={closeCommunityPreview}
          onOpen={() => {}}
          disableSwipeToOpen
          ModalProps={{
            sx: { zIndex: COMMUNITY_PREVIEW_MODAL_Z_INDEX },
          }}
          PaperProps={{ className: stls.drawerPaper }}
        >
          {body}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={open}
          onClose={closeCommunityPreview}
          maxWidth="xs"
          fullWidth
          sx={{ zIndex: COMMUNITY_PREVIEW_MODAL_Z_INDEX }}
          PaperProps={{ className: stls.dialogPaper }}
        >
          {body}
        </Dialog>
      )}
    </CommunityPreviewDrawerContext.Provider>
  );
}
