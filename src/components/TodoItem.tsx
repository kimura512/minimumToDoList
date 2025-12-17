import { IoMdRadioButtonOff } from "react-icons/io";
import { CgPlayButtonO } from "react-icons/cg";
import { IoRadioButtonOn } from "react-icons/io5";
import { CiTrash, CiEdit } from "react-icons/ci";
import type { ToDo, TodoStatus } from "../types";
import { NEXT_STATUS } from "../types";
import { ExpandableText } from "./ExpandableText";

/** アイコンコンポーネントの共通Props */
type IconProps = { className?: string; size?: number; onClick?: () => void };

const RadioButtonOff = IoMdRadioButtonOff as React.ComponentType<IconProps>;
const PlayButtonO = CgPlayButtonO as React.ComponentType<IconProps>;
const RadioButtonOn = IoRadioButtonOn as React.ComponentType<IconProps>;
const TrashIcon = CiTrash as React.ComponentType<IconProps>;
const EditIcon = CiEdit as React.ComponentType<IconProps>;

/** ステータスに応じたアイコンを返す */
const StatusIcon: React.FC<{
  status: TodoStatus;
  onClick: () => void;
}> = ({ status, onClick }) => {
  const iconProps = { className: "list-item-status", size: 20, onClick };

  switch (status) {
    case "untouched":
      return <RadioButtonOff {...iconProps} />;
    case "in-progress":
      return <PlayButtonO {...iconProps} />;
    case "completed":
    case "archived":
      return <RadioButtonOn {...iconProps} />;
  }
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

