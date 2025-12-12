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

export default function ToDoList() {
    const [toDoList, setToDoList] = useState<ToDo[]>([]);
    const [newToDo, setNewToDo] = useState<string>("");
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

    return (
        <div>
            <h1>To Do List</h1>
            <input type="text" placeholder="新規 To Do" value={newToDo} onChange={(e) => setNewToDo(e.target.value)} />
            <button onClick={() => addToDo(newToDo)}>追加</button>
            <div className="untouched-list">
            <ul>
                {untouched.map(t => (
                    <li key={t.id}>
                        <span>{t.title + " " + t.id}</span>
                        <button onClick={() => updateStatus(t.id, "in-progress")}>未着手</button>
                    </li>
                ))}
            </ul>
            </div>
            <div className="in-progress-list">
            <ul>
                {inProgress.map(t => (
                    <li key={t.id}>
                        <span>{t.title + " " + t.id}</span>
                        <button onClick={() => updateStatus(t.id, "completed")}>進行中</button>
                    </li>
                ))}
            </ul>
            </div>
            <div className="completed-list">
            <ul>
                {completed.map(t => (
                    <li key={t.id}>
                        <span>{t.title + " " + t.id}</span>
                        <button onClick={() => updateStatus(t.id, "archived")}>完了</button>
                    </li>
                ))}
            </ul>
            </div>
        </div>
    );
}