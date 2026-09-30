import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Remover',
  pending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} size="sm" onClose={onCancel}>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={pending}>Cancelar</Button>
        <Button variant="danger" type="button" onClick={onConfirm} disabled={pending}>
          {pending ? 'Removendo...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}