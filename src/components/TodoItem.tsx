import { useState } from "react";
import { IoMdRadioButtonOff } from "react-icons/io";
import { CgPlayButtonO } from "react-icons/cg";
import { IoRadioButtonOn } from "react-icons/io5";
import { CiTrash, CiEdit } from "react-icons/ci";
import type { ToDo, TodoStatus, Priority } from "../types";
import { NEXT_STATUS, STATUS_LABELS, PRIORITY_COLORS } from "../types";
import { ExpandableText } from "./ExpandableText";

/** アイコンコンポーネントの共通Props */
type IconProps = { className?: string; size?: number; onClick?: () => void };

const RadioButtonOff = IoMdRadioButtonOff as React.ComponentType<IconProps>;
const PlayButtonO = CgPlayButtonO as React.ComponentType<IconProps>;
const RadioButtonOn = IoRadioButtonOn as React.ComponentType<IconProps>;
const TrashIcon = CiTrash as React.ComponentType<IconProps>;
const EditIcon = CiEdit as React.ComponentType<IconProps>;

/** ステータスに応じたアイコンコンポーネントを返す */
const getIconForStatus = (status: TodoStatus, props: IconProps) => {
  switch (status) {
    case "untouched":
      return <RadioButtonOff {...props} />;
    case "in-progress":
      return <PlayButtonO {...props} />;
    case "completed":
    case "archived":
      return <RadioButtonOn {...props} />;
  }
};

/** 優先度バッジ */
const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  if (priority === "none") return null;
  const labels: Record<Priority, string> = {
    high: "高",
    medium: "中",
    low: "低",
    none: "",
  };
  return (
    <span
      className="priority-badge"
      style={{ backgroundColor: PRIORITY_COLORS[priority] }}
      title={`優先度: ${labels[priority]}`}
    >
      {labels[priority]}
    </span>
  );
};

/** ステータスアイコン（ホバーで次のステータスを表示） */
const StatusIcon: React.FC<{
  status: TodoStatus;
  onClick: () => void;
}> = ({ status, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const nextStatus = NEXT_STATUS[status];
  const canTransition = nextStatus !== status;

  // 現在のステータスまたはホバー時は次のステータスを表示
  const displayStatus = isHovered && canTransition ? nextStatus : status;
  const iconProps = { className: "list-item-status", size: 20 };
  const tooltipText = canTransition
    ? `クリックで「${STATUS_LABELS[nextStatus]}」に変更`
    : "これ以上変更できません";

  return (
    <span
      className="status-icon-wrapper"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={tooltipText}
    >
      {getIconForStatus(displayStatus, iconProps)}
    </span>
  );
};

type TodoItemProps = {
  todo: ToDo;
  onUpdateStatus: (id: string, status: TodoStatus) => void;
  onEdit: (todo: ToDo) => void;
  onDelete: (id: string) => void;
};

/**
 * 個別のToDoアイテムを表示するコンポーネント
 */
export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onUpdateStatus,
  onEdit,
  onDelete,
}) => {
  const handleStatusClick = () => {
    const nextStatus = NEXT_STATUS[todo.status];
    if (nextStatus !== todo.status) {
      onUpdateStatus(todo.id, nextStatus);
    }
  };

  const isOverdue =
    todo.deadline &&
    new Date(todo.deadline) < new Date() &&
    todo.status !== "completed";

  return (
    <li
      key={todo.id}
      style={{ viewTransitionName: todo.id }}
      className={`modern-todo-item ${isOverdue ? "overdue" : ""}`}
    >
      <div className="todo-item-main">
        <div className="todo-item-header">
          <StatusIcon status={todo.status} onClick={handleStatusClick} />
          <PriorityBadge priority={todo.priority || "none"} />
          <h3 className="todo-item-title">{todo.title}</h3>
        </div>

        {todo.description && (
          <div className="todo-item-description">
            <ExpandableText
              className="description-text"
              text={todo.description}
              limit={50}
            />
          </div>
        )}

        <div className="todo-item-meta">
          {todo.deadline && (
            <span className={`deadline ${isOverdue ? "overdue" : ""}`}>
              {new Date(todo.deadline).toLocaleDateString("ja-JP")}
            </span>
          )}
          {todo.tags && todo.tags.length > 0 && (
            <div className="tags">
              {todo.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="todo-item-actions">
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(todo)}
          title="編集"
        >
          <EditIcon size={18} />
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
          title="削除"
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </li>
  );
};
