export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div role="status" aria-label="Carregando tabela" className="animate-pulse px-5 py-4">
      <span className="sr-only">Carregando dados</span>
      <div className="mb-4 grid gap-4 border-b border-border pb-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} className="h-3 rounded bg-surface-hover" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, column) => (
              <div key={column} className="h-4 rounded bg-surface-hover" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}