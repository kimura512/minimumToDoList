import { useState } from "react";
import { IoMdRadioButtonOff } from "react-icons/io";
import { CgPlayButtonO } from "react-icons/cg";
import { IoRadioButtonOn } from "react-icons/io5";
import { CiTrash, CiEdit } from "react-icons/ci";
import type { ToDo, TodoStatus } from "../types";
import { NEXT_STATUS, STATUS_LABELS } from "../types";
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

  return (
    <li
      key={todo.id}
      style={{ viewTransitionName: todo.id }}
      className="list-item"
    >
      <div className="list-item-left-wrapper">
        <StatusIcon status={todo.status} onClick={handleStatusClick} />
        <p className="list-item-title">{todo.title}</p>
      </div>
      <div className="list-item-right-wrapper">
        <EditIcon
          size={20}
          className="list-item-button"
          onClick={() => onEdit(todo)}
        />
        <TrashIcon
          size={20}
          className="list-item-button"
          onClick={() => onDelete(todo.id)}
        />
        <p className="list-item-deadline">{todo.deadline}</p>
        <ExpandableText
          className="list-item-description"
          text={todo.description}
          limit={10}
        />
      </div>
    </li>
  );
};

