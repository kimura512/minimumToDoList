import { useState } from "react";

type ExpandableTextProps = {
  className?: string;
  text?: string;
  limit?: number;
};

/**
 * 長いテキストを省略表示し、クリックで全文表示するコンポーネント
 */
export const ExpandableText: React.FC<ExpandableTextProps> = ({
  className,
  text,
  limit = 10,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > limit;
  const displayText = !isExpanded && isLong ? text.slice(0, limit) + "…" : text;

  return (
    <span
      className={className}
      onClick={() => isLong && setIsExpanded((prev) => !prev)}
      style={{ cursor: isLong ? "pointer" : "default" }}
      title={isLong ? "クリックで全文表示" : undefined}
    >
      {displayText}
    </span>
  );
};

