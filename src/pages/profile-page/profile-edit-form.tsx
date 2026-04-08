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
  sibaNameDraft: string;
  sibaGenderDraft: string;
  sibaIconDraft: string;
  onNicknameChange: (value: string) => void;
  onTgNameChange: (value: string) => void;
  onShowTgNameChange: (checked: boolean) => void;
  onSibaNameChange: (value: string) => void;
  onSibaGenderChange: (value: string) => void;
  onSibaIconChange: (value: string) => void;
};

export const ProfileEditForm = ({
  nicknameDraft,
  tgNameDraft,
  isShowTgNameDraft,
  sibaNameDraft,
  sibaGenderDraft,
  sibaIconDraft,
  onNicknameChange,
  onTgNameChange,
  onShowTgNameChange,
  onSibaNameChange,
  onSibaGenderChange,
  onSibaIconChange,
}: ProfileEditFormProps) => {
  return (
    <div className={stls.editForm}>
      <Input
        label="Никнейм владельца"
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
      <Input
        label="Кличка сибы"
        value={sibaNameDraft}
        onChange={(e) => onSibaNameChange(e.target.value)}
      />
      <div className={stls.fieldGroup}>
        Пол сибы
        <div className={stls.iconRow}>
          <IconButton
            variant={sibaGenderDraft === "male" ? "pressed" : "primary"}
            onClick={() => onSibaGenderChange("male")}
            size="large"
            icon={<IconMale />}
          />
          <IconButton
            variant={sibaGenderDraft === "female" ? "pressed" : "primary"}
            onClick={() => onSibaGenderChange("female")}
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
            onClick={() => onSibaIconChange("default")}
            icon={<IconSibka />}
          />
          <IconButton
            size="large"
            variant={sibaIconDraft === "white" ? "pressed" : "primary"}
            onClick={() => onSibaIconChange("white")}
            icon={<IconSibkaWhite />}
          />
          <IconButton
            size="large"
            variant={sibaIconDraft === "black" ? "pressed" : "primary"}
            onClick={() => onSibaIconChange("black")}
            icon={<IconSibkaBlack />}
          />
        </div>
      </div>
    </div>
  );
};
