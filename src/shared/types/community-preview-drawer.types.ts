export type CommunityPreviewOpenPayload = {
  title: string;
  avatarUrl: string | null;
  externalLink: string | null;
  communityId: string | null;
  /** Если задано — показываем без запроса; иначе грузим по `communityId`. */
  memberCount?: number;
};

export type CommunityMemberPreview = {
  user_id: string;
  siba_id: string | null;
  display_name: string;
  avatar_src: string;
};

export type CommunityPreviewDrawerContextValue = {
  openCommunityPreview: (payload: CommunityPreviewOpenPayload) => void;
  closeCommunityPreview: () => void;
};
