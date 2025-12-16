import { useState } from "react";
import { ulid } from 'ulid';
import { IoMdRadioButtonOff } from "react-icons/io"; // 未着手
import { CgPlayButtonO } from "react-icons/cg"; // 進行中
import { IoRadioButtonOn } from "react-icons/io5"; // 完了・アーカイブ
import { CiTrash, CiEdit } from "react-icons/ci"; // 削除・編集アイコン

// 型アサーションでアイコンコンポーネントをラップ
type IconProps = { className?: string; size?: number; onClick?: () => void };
const RadioButtonOff = IoMdRadioButtonOff as React.ComponentType<IconProps>;
const PlayButtonO = CgPlayButtonO as React.ComponentType<IconProps>;
const RadioButtonOn = IoRadioButtonOn as React.ComponentType<IconProps>;
const TrashIcon = CiTrash as React.ComponentType<IconProps>;
const EditIcon = CiEdit as React.ComponentType<IconProps>;

/**
* @description ToDoListコンポーネント
* ToDoリストを表示するコンポーネント
* タイトル、ステータス、期限、詳細からなります。
* ステータスは、未着手、進行中、完了、アーカイブの4つのステータスがあります。
* 期限は、日付で表示されます。
* 詳細は、テキストで表示されます。
* @function ToDoList
* @param {ToDo[]} toDoList - ToDoリスト
* @param {ToDo[]} filteredToDoList - フィルターされたToDoリスト
* @param {ToDo[]} sortedToDoList - ソートされたToDoリスト
* @param {ToDo[]} sortedUntouched - 未着手のToDoリスト
* @param {ToDo[]} sortedInProgress - 進行中のToDoリスト
* @param {ToDo[]} sortedCompleted - 完了のToDoリスト
* @param {ToDo[]} sortedArchived - アーカイブのToDoリスト
* @param {void} addToDo - ToDoを追加する関数
* @param {void} updateStatus - ToDoのステータスを更新する関数
* @param {void} editToDo - ToDoを編集する関数
* @param {void} deleteToDo - ToDoを削除する関数
* @param {void} setToDoList - ToDoリストを設定する関数
* @param {void} setNewToDoTitle - 新規ToDoのタイトルを設定する関数
* @param {void} setEditingTodo - 編集中のToDoを設定する関数
* @param {void} setFilterStatus - フィルターステータスを設定する関数
* @param {void} setSortBy - ソートステータスを設定する関数
* @function EditTodoModal
* @param {ToDo} todo - ToDo
* @param {void} onClose - モーダルを閉じる関数
* @param {void} onSave - ToDoを保存する関数
* @function ExpandableText
* @param {string} text - テキスト
* @param {number} limit - 省略表示する文字数
* @function ExpandableText
* @param {string} text - テキスト
* @param {number} limit - 省略表示する文字数
* @param {void} setOpen - モーダルを開く関数
* @param {boolean} open - モーダルが開いているかどうか
* @param {boolean} isLong - テキストが長いかどうか
* @param {string} shown - 省略表示されたテキスト
* @returns {React.ReactNode}
*/

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

    const vt = (fn: () => void) => (document as any).startViewTransition ? (document as any).startViewTransition(fn) : fn();

    const addToDo = (title: string) => {
      if (title.trim() === "") {
        return;
      }
      vt(() => setToDoList(prev => [...prev, { id: ulid(), title, status: "untouched" }]));
      setNewToDoTitle("");
    };
    const updateStatus = (id: ULID, status: TodoStatus) =>
      vt(() => setToDoList(prev => prev.map(t => t.id === id ? { ...t, status } : t)));
    const editToDo = (toDo: ToDo) => {
        setEditingTodo(toDo);
    };
    const deleteToDo = (id: ULID) => {
      const result = window.confirm("本当に削除しますか？");
      if (result) {
        vt(() => setToDoList(prev => prev.filter(t => t.id !== id)));
      }else{
        return;
      }
    };
    return (
    /* カラムコンテナ */
        <div className="column-container">
          <h1>Minimum To Do List</h1>
          {editingTodo && 
          /* 編集モーダル */
          (<EditTodoModal
              todo={editingTodo}
              onClose={() => setEditingTodo(undefined)}
              onSave={(updated: ToDo) => {
              setToDoList(prev => prev.map(t => (t.id === updated.id ? updated : t)));
              setEditingTodo(undefined);
              }}
          />)
          }
          {/* メニュー */}
          <div className="menu">
            {/* 新規 To Do 追加入力フィールド */}
            <input className="add-input" type="text" placeholder="新規 To Do" value={newToDoTitle} onChange={(e) => setNewToDoTitle(e.target.value)} />
            {/* 新規 To Do 追加ボタン */}
            <button className="add-button" onClick={() => addToDo(newToDoTitle)}>追加</button>
            {/* ステータスフィルタリングボタン */}
            <select className="filter-button" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}>
                <option value="none">フィルターなし</option>
                <option value="untouched">未着手</option>
                <option value="in-progress">進行中</option>
                <option value="completed">完了</option>
                <option value="archived">アーカイブ</option>
            </select>
            {/* 期限でソートボタン */}
            <select className="sort-button" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                <option value="none">ソートなし</option>
                <option value="deadline">期限</option>
                <option value="title">タイトル</option>
            </select>
          </div>                    
            {/* 未着手リスト */}
            <div className="list untouched">
              <h4>未着手</h4>
            <ul>
                {sortedUntouched.map(t => (
                    <li key={t.id} style={{ viewTransitionName: t.id }}  className="list-item">
                      <div className="list-item-left-wrapper">
                        <RadioButtonOff className="list-item-status"  size={20} onClick={() => updateStatus(t.id, "in-progress")}/>
                        <p className="list-item-title">{t.title}</p>
                      </div>
                      <div className="list-item-right-wrapper">
                        <EditIcon size={20} className="list-item-button" onClick={() => editToDo(t)} />
                        <TrashIcon size={20} className="list-item-button" onClick={() => deleteToDo(t.id)} />
                        <p className="list-item-deadline">{t.deadline}</p>
                        <ExpandableText className="list-item-description" text={t.description || undefined} limit={10} />
                      </div>
                    </li>
                ))}
            </ul>
            </div>
            {/* 進行中リスト */}
            <div className="list in-progress">
              <h4>進行中</h4>
            <ul>
                {sortedInProgress.map(t => (
                    <li key={t.id} style={{ viewTransitionName: t.id }}  className="list-item">
                      <div className="list-item-left-wrapper">
                        <PlayButtonO className="list-item-status"  size={20} onClick={() => updateStatus(t.id, "completed")}/>
                        <p className="list-item-title">{t.title}</p>
                      </div>
                      <div className="list-item-right-wrapper">
                        <EditIcon size={20} className="list-item-button" onClick={() => editToDo(t)} />
                        <TrashIcon size={20} className="list-item-button" onClick={() => deleteToDo(t.id)} />
                        <p className="list-item-deadline">{t.deadline}</p>
                        <ExpandableText className="list-item-description" text={t.description || undefined} limit={10} />
                      </div>
                    </li>
                ))}
            </ul>
            </div>
            {/* 完了リスト */}
            <div className="list completed">
              <h4>完了</h4>
            <ul>
                {sortedCompleted.map(t => (
                    <li key={t.id} style={{ viewTransitionName: t.id }}  className="list-item">
                      <div className="list-item-left-wrapper">
                        <RadioButtonOn className="list-item-status" size={20} onClick={() => updateStatus(t.id, "archived")}/>                        
                        <p className="list-item-title">{t.title}</p>
                      </div>
                      <div className="list-item-right-wrapper">
                        <EditIcon size={20} className="list-item-button" onClick={() => editToDo(t)} />
                        <TrashIcon size={20} className="list-item-button" onClick={() => deleteToDo(t.id)} />
                        <p className="list-item-deadline">{t.deadline}</p>
                        <ExpandableText className="list-item-description" text={t.description || undefined} limit={10} />
                      </div>
                    </li>
                ))}
            </ul>
            </div>
            {filterStatus === "archived" && <div className="list archived">
              <h4>アーカイブ</h4>
            <ul>
                {sortedArchived.map(t => (
                    <li key={t.id} style={{ viewTransitionName: t.id }}  className="list-item">
                      <div className="list-item-left-wrapper">
                        <RadioButtonOn className="list-item-status" size={20} onClick={() => updateStatus(t.id, "archived")}/>                        
                        <p className="list-item-title">{t.title}</p>
                      </div>
                      <div className="list-item-right-wrapper">
                        <EditIcon size={20} className="list-item-button" onClick={() => editToDo(t)} />
                        <TrashIcon size={20} className="list-item-button" onClick={() => deleteToDo(t.id)} />
                        <p className="list-item-deadline">{t.deadline}</p>
                        <ExpandableText className="list-item-description" text={t.description || undefined} limit={10} />
                      </div>
                    </li>
                ))}
            </ul>
            </div>}
        </div>
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
  

// テキストを省略表示するコンポーネント
function ExpandableText({
  className,
  text,
  limit = 10,
}: {
  className?: string;
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