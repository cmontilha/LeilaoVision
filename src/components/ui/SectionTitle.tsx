interface SectionTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionTitle({ title, description, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-lv-text">{title}</h2>
        {description ? <p className="mt-1 text-sm text-lv-textMuted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
