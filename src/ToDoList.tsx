import { useState, useMemo, useCallback } from "react";
import { ulid } from "ulid";
import type { ToDo, TodoStatus, FilterStatus, SortBy, ULID } from "./types";
import { STATUS_LABELS } from "./types";
import { EditTodoModal, TodoList } from "./components";

// View Transition API の型拡張
declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => void;
  }
}

/**
 * View Transition APIをサポートしている場合はトランジション付きで実行
 */
const withViewTransition = (fn: () => void) => {
  if (document.startViewTransition) {
    document.startViewTransition(fn);
  } else {
    fn();
  }
};

/** 表示するステータスの順序（アーカイブ以外） */
const VISIBLE_STATUSES: TodoStatus[] = ["untouched", "in-progress", "completed"];

/**
 * ToDoリストのメインコンポーネント
 */
export default function ToDoListApp() {
  const [toDoList, setToDoList] = useState<ToDo[]>([]);
  const [newToDoTitle, setNewToDoTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState<ToDo | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("none");
  const [sortBy, setSortBy] = useState<SortBy>("none");

  // フィルタリング＆ソート済みリストをメモ化
  const sortedToDoList = useMemo(() => {
    // フィルタリング
    const filtered =
      filterStatus === "none"
        ? toDoList
        : toDoList.filter((t) => t.status === filterStatus);

    // ソート
    if (sortBy === "none") return filtered;

    return [...filtered].sort((a, b) => {
      if (sortBy === "deadline") {
        const aDate = a.deadline ?? "9999-12-31";
        const bDate = b.deadline ?? "9999-12-31";
        return aDate.localeCompare(bDate);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [toDoList, filterStatus, sortBy]);

  // ステータスごとにグループ化
  const todosByStatus = useMemo(() => {
    const grouped: Record<TodoStatus, ToDo[]> = {
      untouched: [],
      "in-progress": [],
      completed: [],
      archived: [],
    };
    for (const todo of sortedToDoList) {
      grouped[todo.status].push(todo);
    }
    return grouped;
  }, [sortedToDoList]);

  // === アクション関数（useCallbackでメモ化） ===

  const addToDo = useCallback(() => {
    const trimmedTitle = newToDoTitle.trim();
    if (trimmedTitle === "") return;

    withViewTransition(() => {
      setToDoList((prev) => [
        ...prev,
        { id: ulid(), title: trimmedTitle, status: "untouched" },
      ]);
    });
    setNewToDoTitle("");
  }, [newToDoTitle]);

  const updateStatus = useCallback((id: ULID, status: TodoStatus) => {
    withViewTransition(() => {
      setToDoList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    });
  }, []);

  const deleteToDo = useCallback((id: ULID) => {
    if (!window.confirm("本当に削除しますか？")) return;

    withViewTransition(() => {
      setToDoList((prev) => prev.filter((t) => t.id !== id));
    });
  }, []);

  const saveToDo = useCallback((updated: ToDo) => {
    setToDoList((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    setEditingTodo(null);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addToDo();
    }
  };

  return (
    <div className="column-container">
      <h1>Minimum To Do List</h1>

      {/* 編集モーダル */}
      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSave={saveToDo}
        />
      )}

      {/* メニューバー */}
      <div className="menu">
        <input
          className="add-input"
          type="text"
          placeholder="新規 To Do"
          value={newToDoTitle}
          onChange={(e) => setNewToDoTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="add-button" onClick={addToDo}>
          追加
        </button>

        <select
          className="filter-button"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
        >
          <option value="none">フィルターなし</option>
          {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          className="sort-button"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
        >
          <option value="none">ソートなし</option>
          <option value="deadline">期限</option>
          <option value="title">タイトル</option>
        </select>
      </div>

      {/* 各ステータスのリスト */}
      {VISIBLE_STATUSES.map((status) => (
        <TodoList
          key={status}
          title={STATUS_LABELS[status]}
          status={status}
          todos={todosByStatus[status]}
          onUpdateStatus={updateStatus}
          onEdit={setEditingTodo}
          onDelete={deleteToDo}
        />
      ))}

      {/* アーカイブはフィルターで選択時のみ表示 */}
      {filterStatus === "archived" && (
        <TodoList
          title={STATUS_LABELS.archived}
          status="archived"
          todos={todosByStatus.archived}
          onUpdateStatus={updateStatus}
          onEdit={setEditingTodo}
          onDelete={deleteToDo}
        />
      )}
    </div>
  );
}
