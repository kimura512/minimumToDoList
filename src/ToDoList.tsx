import { useState, useMemo, useCallback, useEffect } from "react";
import { ulid } from "ulid";
import type { ToDo, TodoStatus, FilterStatus, SortBy, ULID, Priority } from "./types";
import { STATUS_LABELS } from "./types";
import { EditTodoModal, TodoList } from "./components";
import { loadTodosFromStorage, saveTodosToStorage } from "./utils/storage";

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
 * モダンなToDoリストのメインコンポーネント
 */
export default function ToDoListApp() {
  const [toDoList, setToDoList] = useState<ToDo[]>(() => loadTodosFromStorage());
  const [newToDoTitle, setNewToDoTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState<ToDo | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("none");
  const [sortBy, setSortBy] = useState<SortBy>("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // LocalStorageに自動保存
  useEffect(() => {
    saveTodosToStorage(toDoList);
  }, [toDoList]);

  // 全タグを取得
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    toDoList.forEach((todo) => {
      todo.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [toDoList]);

  // フィルタリング＆ソート済みリストをメモ化
  const sortedToDoList = useMemo(() => {
    let filtered = toDoList;

    // ステータスフィルター
    if (filterStatus !== "none") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // 検索クエリ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // タグフィルター
    if (selectedTags.length > 0) {
      filtered = filtered.filter((t) =>
        selectedTags.every((tag) => t.tags?.includes(tag))
      );
    }

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
      if (sortBy === "priority") {
        const priorityOrder: Record<Priority, number> = {
          high: 3,
          medium: 2,
          low: 1,
          none: 0,
        };
        return (
          priorityOrder[b.priority || "none"] -
          priorityOrder[a.priority || "none"]
        );
      }
      if (sortBy === "created") {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return 0;
    });
  }, [toDoList, filterStatus, sortBy, searchQuery, selectedTags]);

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

  // 統計情報
  const stats = useMemo(() => {
    const total = toDoList.length;
    const completed = toDoList.filter((t) => t.status === "completed").length;
    const inProgress = toDoList.filter((t) => t.status === "in-progress")
      .length;
    const untouched = toDoList.filter((t) => t.status === "untouched").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      untouched,
      completionRate,
    };
  }, [toDoList]);

  // === アクション関数（useCallbackでメモ化） ===

  const addToDo = useCallback(() => {
    const trimmedTitle = newToDoTitle.trim();
    if (trimmedTitle === "") return;

    const now = new Date().toISOString();
    withViewTransition(() => {
      setToDoList((prev) => [
        ...prev,
        {
          id: ulid(),
          title: trimmedTitle,
          status: "untouched",
          priority: "none",
          tags: [],
          createdAt: now,
        },
      ]);
    });
    setNewToDoTitle("");
  }, [newToDoTitle]);

  const updateStatus = useCallback((id: ULID, status: TodoStatus) => {
    withViewTransition(() => {
      setToDoList((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status, updatedAt: new Date().toISOString() }
            : t
        )
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
      prev.map((t) =>
        t.id === updated.id
          ? { ...updated, updatedAt: new Date().toISOString() }
          : t
      )
    );
    setEditingTodo(null);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addToDo();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="modern-todo-app">
      <header className="app-header">
        <h1 className="app-title">
          To Do List
        </h1>
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">総数</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">完了率</span>
            <span className="stat-value">{stats.completionRate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">進行中</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
        </div>
      </header>

      {/* 編集モーダル */}
      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSave={saveToDo}
        />
      )}

      {/* コントロールパネル */}
      <div className="control-panel">
        <div className="input-group">
          <input
            className="todo-input"
            type="text"
            placeholder="新しいタスクを追加..."
            value={newToDoTitle}
            onChange={(e) => setNewToDoTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="add-btn" onClick={addToDo}>
            <span>追加</span>
          </button>
        </div>

        <div className="filter-group">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="none">すべてのステータス</option>
            {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="none">ソートなし</option>
            <option value="priority">優先度</option>
            <option value="deadline">期限</option>
            <option value="title">タイトル</option>
            <option value="created">作成日</option>
          </select>
        </div>

        {/* タグフィルター */}
        {allTags.length > 0 && (
          <div className="tags-filter">
            <span className="tags-label">タグ:</span>
            <div className="tags-list">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-chip ${selectedTags.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 各ステータスのリスト */}
      <div className="todo-lists-container">
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
      </div>

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
