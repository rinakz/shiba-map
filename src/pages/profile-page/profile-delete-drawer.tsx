import { Drawer } from "@mui/material";
import { Button } from "../../shared/ui";
import stls from "./profile.module.sass";

type ProfileDeleteDrawerProps = {
  open: boolean;
  isDeletingAccount: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export const ProfileDeleteDrawer = ({
  open,
  isDeletingAccount,
  onClose,
  onDelete,
}: ProfileDeleteDrawerProps) => {
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <div className={stls.deleteDrawer}>
        <div className={stls.deleteCard}>
          <h3>Удалить аккаунт?</h3>
          <p>Это действие необратимо. Будут удалены данные пользователя и сибы.</p>
          <div className={stls.deleteActions}>
            <Button
              size="large"
              variant="secondary"
              className={stls.fullWidth}
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              size="large"
              className={stls.fullWidth}
              loading={isDeletingAccount}
              onClick={onDelete}
            >
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
