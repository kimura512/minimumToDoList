import { useState } from "react";
import type { ToDo, TodoStatus } from "../types";
import { STATUS_LABELS } from "../types";
import "./EditTodoModal.css";

type EditTodoModalProps = {
  todo: ToDo;
  onClose: () => void;
  onSave: (todo: ToDo) => void;
};

/**
 * ToDo編集用モーダルコンポーネント
 */
export const EditTodoModal: React.FC<EditTodoModalProps> = ({
  todo,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(todo.title);
  const [status, setStatus] = useState(todo.status);
  const [description, setDescription] = useState(todo.description ?? "");
  const [deadline, setDeadline] = useState(todo.deadline ?? "");

  const handleSave = () => {
    if (title.trim() === "") return;
    onSave({
      ...todo,
      title: title.trim(),
      status,
      description: description || undefined,
      deadline: deadline || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">編集</h3>

        <label className="modal-label">タイトル</label>
        <input
          className="modal-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力"
        />

        <label className="modal-label">ステータス</label>
        <select
          className="modal-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as TodoStatus)}
        >
          {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <label className="modal-label">詳細</label>
        <textarea
          className="modal-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細を入力"
        />

        <label className="modal-label">期限</label>
        <input
          className="modal-input"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="modal-button-save" onClick={handleSave}>
            保存
          </button>
          <button className="modal-button-cancel" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

