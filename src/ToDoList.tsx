import { useState } from "react";
import { ulid } from 'ulid';

// 型定義
type ULID = string;
type TodoStatus = "untouched" | "in-progress" | "completed" | "archived";
type FilterStatus = "none" | TodoStatus;
type SortBy = "none" | "deadline" | "title";
type ToDo = {
  id: ULID;
  title: string;
  status: TodoStatus;
  description?: string | null;
  deadline?: string | null;
};

// メインコンポーネント
export default function ToDoList() {
    const [toDoList, setToDoList] = useState<ToDo[]>([]);
    const [newToDoTitle, setNewToDoTitle] = useState<string>("");
    const [editingTodo, setEditingTodo] = useState<ToDo>();
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("none");
    const filteredToDoList = filterStatus === "none"
        ? toDoList
        : toDoList.filter(t => t.status === filterStatus);
    const [sortBy, setSortBy] = useState<SortBy>("none");
    const sortedToDoList = sortBy === "none"
        ? filteredToDoList
        : [...filteredToDoList].sort((a, b) => {
            if (sortBy === "deadline") {
              // 期限でソート
              const ad = a.deadline ?? "9999-12-31";
              const bd = b.deadline ?? "9999-12-31";
              return ad.localeCompare(bd);
            } else if (sortBy === "title") {
              // タイトルでソート
              return a.title.localeCompare(b.title);            
            } else {
              // ソートなし
                return 0;
            }
        });
    console.log(sortedToDoList);
    const sortedUntouched = sortedToDoList.filter(t => t.status === "untouched");
    const sortedInProgress = sortedToDoList.filter(t => t.status === "in-progress");
    const sortedCompleted = sortedToDoList.filter(t => t.status === "completed");
    const sortedArchived = sortedToDoList.filter(t => t.status === "archived");
  
    const addToDo = (title: string) => {
        setToDoList(prev => [...prev, { id: ulid(), title, status: "untouched" }]);
    };
    const updateStatus = (id: ULID, status: TodoStatus) => {
        setToDoList(prev =>
          prev.map(t => (t.id === id ? { ...t, status } : t))
        );
      };
    const editToDo = (toDo: ToDo) => {
        setEditingTodo(toDo);
    };
    const deleteToDo = (id: ULID) => {
        setToDoList(prev => prev.filter(t => t.id !== id));
    };
    return (
        <div>
            <h1>Minimum To Do List</h1>
            {editingTodo && 
            (<EditTodoModal
                todo={editingTodo}
                onClose={() => setEditingTodo(undefined)}
                onSave={(updated: ToDo) => {
                setToDoList(prev => prev.map(t => (t.id === updated.id ? updated : t)));
                setEditingTodo(undefined);
                }}
            />)
            }
            {/* 新規 To Do 追加 */}
            <input type="text" placeholder="新規 To Do" value={newToDoTitle} onChange={(e) => setNewToDoTitle(e.target.value)} />
            {/* 追加ボタン */}
            <button onClick={() => addToDo(newToDoTitle)}>追加</button>
            {/* ステータスフィルタボタン */}
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}>
                <option value="none">フィルターなし</option>
                <option value="untouched">未着手</option>
                <option value="in-progress">進行中</option>
                <option value="completed">完了</option>
                <option value="archived">アーカイブ</option>
            </select>
            {/* 期限でソートボタン */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                <option value="none">ソートなし</option>
                <option value="deadline">期限</option>
                <option value="title">タイトル</option>
            </select>            
            <div className="untouched-list">
            <ul>
                {sortedUntouched.map(t => (
                    <li key={t.id}>
                        <span>{t.title}</span>
                        <button onClick={() => updateStatus(t.id, "in-progress")}>未着手</button>
                        <button onClick={() => editToDo(t)}>✐</button>
                        <button onClick={() => deleteToDo(t.id)}>🚮</button>
                        <span>|{t.deadline}|</span>
                        <ExpandableText text={t.description || undefined} limit={10} />
                    </li>
                ))}
            </ul>
            </div>
            <div className="in-progress-list">
            <ul>
                {sortedInProgress.map(t => (
                    <li key={t.id}>
                        <span>{t.title}</span>
                        <button onClick={() => updateStatus(t.id, "completed")}>進行中</button>
                        <button onClick={() => editToDo(t)}>✐</button>
                        <button onClick={() => deleteToDo(t.id)}>🚮</button>
                        <span>{t.deadline}</span>
                    </li>
                ))}
            </ul>
            </div>
            <div className="completed-list">
            <ul>
                {sortedCompleted.map(t => (
                    <li key={t.id}>
                        <span>{t.title}</span>
                        <button onClick={() => updateStatus(t.id, "archived")}>完了</button>
                        <button onClick={() => editToDo(t)}>✐</button>
                        <button onClick={() => deleteToDo(t.id)}>🚮</button>    
                        <span>{t.deadline}</span>
                    </li>
                ))}
            </ul>
            </div>
            {filterStatus === "archived" && <div className="archived-list">
            <ul>
                {sortedArchived.map(t => (
                    <li key={t.id}>
                        <span>{t.title}</span>
                        <button onClick={() => editToDo(t)}>✐</button>
                        <button onClick={() => deleteToDo(t.id)}>🚮</button>    
                        <span>{t.deadline}</span>
                    </li>
                ))}
            </ul>
            </div>}
        </div>
    );
}


// テキストを省略表示するコンポーネント
function ExpandableText({
  text,
  limit = 10,
}: {
  text?: string;
  limit?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  const isLong = text.length > limit;
  const shown = !open && isLong ? text.slice(0, limit) + "…" : text;

  return (
    <span
      onClick={() => isLong && setOpen((v) => !v)}
      style={{ cursor: isLong ? "pointer" : "default" }}
      title={isLong ? "クリックで全文" : undefined}
    >
      {shown}
    </span>
  );
}

// 編集モーダルコンポーネント
function EditTodoModal({
    todo,
    onClose,
    onSave,
  }: {
    todo: ToDo;
    onClose: () => void;
    onSave: (t: ToDo) => void;
  }) {
    const [title, setTitle] = useState(todo.title);    
    const [status, setStatus] = useState(todo.status);
    const [description, setDescription] = useState(todo.description || "");
    const [deadline, setDeadline] = useState(todo.deadline || "");  
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "white", padding: 16, borderRadius: 8, minWidth: 320 }}>
          <h3>編集</h3>
          <label>タイトル</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <label>ステータス</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TodoStatus)}>
            <option value="untouched">未着手</option>
            <option value="in-progress">進行中</option>
            <option value="completed">完了</option>
            <option value="archived">アーカイブ</option>
          </select>
          <label>詳細</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <label>期限</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={() => onSave({ ...todo, title, status, description, deadline})}>保存</button>
            <button onClick={onClose}>キャンセル</button>
          </div>
        </div>
      </div>
    );
  }
  