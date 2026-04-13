/** Модалка превью сообщества — поверх листов лайков (2000), сторис (1600) и др. */
export const COMMUNITY_PREVIEW_MODAL_Z_INDEX = 3000;

/** Сколько аватарок показывать в стеке на главном экране превью. */
export const COMMUNITY_PREVIEW_MEMBER_FACE_COUNT = 8;

export const COMMUNITY_PREVIEW_LEADERBOARD_QK_MEMBERSHIPS = [
  "leaderboard",
  "community-memberships",
] as const;

export const COMMUNITY_PREVIEW_LEADERBOARD_QK_COMMUNITIES = [
  "leaderboard",
  "communities",
] as const;

export const communityPreviewMembersListQueryKey = (communityId: string) =>
  ["community-members-list", communityId] as const;
