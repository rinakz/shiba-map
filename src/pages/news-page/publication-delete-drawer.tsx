import { Drawer } from "@mui/material";
import { Button } from "../../shared/ui";
import { NEWS_Z_INDEX_PUBLICATION_DELETE } from "./news-page.constants";
import pageStls from "./news-page.module.sass";

type Props = {
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const PublicationDeleteDrawer = ({
  open,
  isDeleting,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ sx: { zIndex: NEWS_Z_INDEX_PUBLICATION_DELETE } }}
    >
      <div className={pageStls.publicationDeleteDrawer}>
        <div className={pageStls.publicationDeleteCard}>
          <h3 className={pageStls.publicationDeleteTitle}>Удалить публикацию?</h3>
          <p className={pageStls.publicationDeleteText}>
            Фото исчезнет из сторис и из раздела «Публикации». Это действие нельзя
            отменить.
          </p>
          <div className={pageStls.publicationDeleteActions}>
            <Button
              size="large"
              variant="secondary"
              className={pageStls.publicationDeleteFullBtn}
              onClick={onClose}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              size="large"
              variant="primary"
              className={pageStls.publicationDeleteFullBtn}
              loading={isDeleting}
              onClick={onConfirm}
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
