export type ShibaType = {
  id: string;
  siba_user_id: string;
  siba_name: string;
  siba_icon: string;
  siba_gender: string;
  coordinates: string;
};

export type ShibaUser = {
  user_id: string;
  email: string;
  nickname: string;
  tgname: string;
  is_show_tgname: boolean;
  telegram_chat: string;
};
