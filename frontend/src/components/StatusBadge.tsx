type Status = 'active' | 'inactive' | 'completed' | 'cancelled';

const statusStyles: Record<Status, string> = {
  active: 'border-success/20 bg-success/10 text-success',
  inactive: 'border-border bg-surface-hover text-muted',
  completed: 'border-info/20 bg-info/10 text-info',
  cancelled: 'border-danger/20 bg-danger/10 text-danger',
};

const statusLabels: Record<Status, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const displayLabel = label || statusLabels[status];

  return (
    <span
      aria-label={`Status: ${displayLabel}`}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {displayLabel}
    </span>
  );
}