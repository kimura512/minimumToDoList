import { useState } from "react";
import { ulid } from 'ulid';

type ULID = string;
type Status = "untouched" | "in-progress" | "completed" | "archived";
type ToDo = {
  id: ULID;
  title: string;
  status: Status;
  description?: string | null;
  deadline?: string | null;
};

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
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
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
  
export default function ToDoList() {
    const [toDoList, setToDoList] = useState<ToDo[]>([]);
    const [newToDoTitle, setNewToDoTitle] = useState<string>("");
    const [editingTodo, setEditingTodo] = useState<ToDo>();
    const untouched = toDoList.filter(t => t.status === "untouched");
    const inProgress = toDoList.filter(t => t.status === "in-progress");
    const completed = toDoList.filter(t => t.status === "completed");
    //const archived = toDoList.filter(t => t.status === "archived");

    const addToDo = (title: string) => {
        setToDoList(prev => [...prev, { id: ulid(), title, status: "untouched" }]);
    };
    const updateStatus = (id: ULID, status: Status) => {
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
            <input type="text" placeholder="新規 To Do" value={newToDoTitle} onChange={(e) => setNewToDoTitle(e.target.value)} />
            <button onClick={() => addToDo(newToDoTitle)}>追加</button>
            <div className="untouched-list">
            <ul>
                {untouched.map(t => (
                    <li key={t.id}>
                        <span>{t.title}</span>
                        <button onClick={() => updateStatus(t.id, "in-progress")}>未着手</button>
                        <button onClick={() => editToDo(t)}>✐</button>
                        <button onClick={() => deleteToDo(t.id)}>🚮</button>
                        <span>{t.deadline}</span>
                    </li>
                ))}
            </ul>
            </div>
            <div className="in-progress-list">
            <ul>
                {inProgress.map(t => (
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
                {completed.map(t => (
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
        </div>
    );
}