
type PathDisplayProps = {
  path: string;
  className?: string;
};

export const PathDisplay = ({ path, className }: PathDisplayProps) => {
  const segments = path.split("/").filter(Boolean);

  return (
    <span className={className}>
      <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
        {segments.map((seg, index) => (
          <span key={index}>
            {index !== 0 && " / "}
            <span dir="rtl">{seg}</span>
          </span>
        ))}
      </span>
    </span>
  );
};