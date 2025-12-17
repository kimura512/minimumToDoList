import { useState } from "react";
import type { ToDo, TodoStatus, Priority } from "../types";
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from "../types";
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
  const [priority, setPriority] = useState<Priority>(todo.priority || "none");
  const [tags, setTags] = useState<string>(todo.tags?.join(", ") || "");
  const [newTag, setNewTag] = useState("");

  const handleSave = () => {
    if (title.trim() === "") return;
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onSave({
      ...todo,
      title: title.trim(),
      status,
      description: description || undefined,
      deadline: deadline || undefined,
      priority,
      tags: tagArray.length > 0 ? tagArray : undefined,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => (prev ? `${prev}, ${newTag.trim()}` : newTag.trim()));
      setNewTag("");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">📝 タスクを編集</h3>

        <div className="modal-section">
          <label className="modal-label">タイトル *</label>
          <input
            className="modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タスクのタイトル"
            autoFocus
          />
        </div>

        <div className="modal-row">
          <div className="modal-section">
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
          </div>

          <div className="modal-section">
            <label className="modal-label">優先度</label>
            <select
              className="modal-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-section">
          <label className="modal-label">詳細</label>
          <textarea
            className="modal-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="タスクの詳細を入力..."
            rows={4}
          />
        </div>

        <div className="modal-section">
          <label className="modal-label">期限</label>
          <input
            className="modal-input"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="modal-section">
          <label className="modal-label">タグ（カンマ区切り）</label>
          <input
            className="modal-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例: 仕事, 重要, 緊急"
          />
          <div className="tag-input-group">
            <input
              className="modal-input tag-input"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="新しいタグを追加"
            />
            <button className="tag-add-btn" onClick={addTag}>
              追加
            </button>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="modal-button-save" onClick={handleSave}>
            💾 保存
          </button>
          <button className="modal-button-cancel" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
