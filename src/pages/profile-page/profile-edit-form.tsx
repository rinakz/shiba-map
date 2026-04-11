import cn from "classnames";
import { Checkbox } from "@mui/material";
import {
  IconFemale,
  IconMale,
  IconSibka,
  IconSibkaBlack,
  IconSibkaWhite,
} from "../../shared/icons";
import { IconButton, Input } from "../../shared/ui";
import stls from "./profile.module.sass";

type ProfileEditFormProps = {
  nicknameDraft: string;
  tgNameDraft: string;
  isShowTgNameDraft: boolean;
  onNicknameChange: (value: string) => void;
  onTgNameChange: (value: string) => void;
  onShowTgNameChange: (checked: boolean) => void;
  breederMode?: boolean;
  sibaNameDraft?: string;
  sibaGenderDraft?: string;
  sibaIconDraft?: string;
  onSibaNameChange?: (value: string) => void;
  onSibaGenderChange?: (value: string) => void;
  onSibaIconChange?: (value: string) => void;
  kennelNameDraft?: string;
  kennelPrefixDraft?: string;
  kennelAddressDraft?: string;
  onKennelNameChange?: (value: string) => void;
  onKennelPrefixChange?: (value: string) => void;
  onKennelAddressChange?: (value: string) => void;
};

export const ProfileEditForm = ({
  nicknameDraft,
  tgNameDraft,
  isShowTgNameDraft,
  onNicknameChange,
  onTgNameChange,
  onShowTgNameChange,
  breederMode = false,
  sibaNameDraft = "",
  sibaGenderDraft = "male",
  sibaIconDraft = "default",
  onSibaNameChange,
  onSibaGenderChange,
  onSibaIconChange,
  kennelNameDraft = "",
  kennelPrefixDraft = "",
  kennelAddressDraft = "",
  onKennelNameChange,
  onKennelPrefixChange,
  onKennelAddressChange,
}: ProfileEditFormProps) => {
  return (
    <div className={stls.editForm}>
      <Input
        label={breederMode ? "Никнейм заводчика" : "Никнейм владельца"}
        value={nicknameDraft}
        onChange={(e) => onNicknameChange(e.target.value)}
      />
      <Input
        label="Telegram username"
        value={tgNameDraft}
        onChange={(e) => onTgNameChange(e.target.value)}
      />
      <label className={stls.checkRow}>
        <Checkbox
          checked={isShowTgNameDraft}
          onChange={(e) => onShowTgNameChange(e.target.checked)}
        />
        Показывать telegram-имя
      </label>
      {breederMode ? (
        <>
          <Input
            label="Название питомника"
            value={kennelNameDraft}
            onChange={(e) => onKennelNameChange?.(e.target.value)}
          />
          <Input
            label="Приставка питомника"
            value={kennelPrefixDraft}
            onChange={(e) => onKennelPrefixChange?.(e.target.value)}
            placeholder="Для поиска в каталоге"
          />
          <Input
            label="Адрес питомника"
            value={kennelAddressDraft}
            onChange={(e) => onKennelAddressChange?.(e.target.value)}
          />
        </>
      ) : (
        <>
          <Input
            label="Кличка сибы"
            value={sibaNameDraft}
            onChange={(e) => onSibaNameChange?.(e.target.value)}
          />
          <div className={stls.fieldGroup}>
            Пол сибы
            <div className={stls.iconRow}>
              <IconButton
                variant={sibaGenderDraft === "male" ? "pressed" : "primary"}
                onClick={() => onSibaGenderChange?.("male")}
                size="large"
                icon={<IconMale />}
              />
              <IconButton
                variant={sibaGenderDraft === "female" ? "pressed" : "primary"}
                onClick={() => onSibaGenderChange?.("female")}
                size="large"
                icon={<IconFemale />}
              />
            </div>
          </div>
          <div className={stls.fieldGroup}>
            Цвет сибы
            <div className={cn(stls.iconRow, stls.iconRowClickable)}>
              <IconButton
                size="large"
                variant={sibaIconDraft === "default" ? "pressed" : "primary"}
                onClick={() => onSibaIconChange?.("default")}
                icon={<IconSibka />}
              />
              <IconButton
                size="large"
                variant={sibaIconDraft === "white" ? "pressed" : "primary"}
                onClick={() => onSibaIconChange?.("white")}
                icon={<IconSibkaWhite />}
              />
              <IconButton
                size="large"
                variant={sibaIconDraft === "black" ? "pressed" : "primary"}
                onClick={() => onSibaIconChange?.("black")}
                icon={<IconSibkaBlack />}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
