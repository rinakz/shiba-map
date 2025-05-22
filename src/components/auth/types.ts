type TGNameType = {
  name: string;
  show: boolean;
};

export type AuthFormType = {
  nickname: string;
  password: string;
  tgname: TGNameType;
  chat: string;
  sibaname: string;
  icon: string;
  location: string;
};
