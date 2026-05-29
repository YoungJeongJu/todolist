import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog__title">{title}</h2>
        <p className="dialog__body">{message}</p>
        <div className="dialog__actions">
          <button type="button" className="btn-text" onClick={onCancel}>
            {t('confirm.cancelBtn')}
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel ?? t('confirm.confirmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
