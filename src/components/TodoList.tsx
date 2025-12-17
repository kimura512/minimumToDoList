import type { ToDo, TodoStatus } from "../types";
import { STATUS_LABELS } from "../types";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  title: string;
  status: TodoStatus;
  todos: ToDo[];
  onUpdateStatus: (id: string, status: TodoStatus) => void;
  onEdit: (todo: ToDo) => void;
  onDelete: (id: string) => void;
};

/**
 * ステータスごとのToDoリストを表示するコンポーネント
 */
export const TodoList: React.FC<TodoListProps> = ({
  title,
  status,
  todos,
  onUpdateStatus,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={`list ${status}`}>
      <h4>{title}</h4>
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdateStatus={onUpdateStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};

