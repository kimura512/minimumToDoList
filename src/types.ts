/**
 * ToDoリストアプリの型定義
 */

/** ULID形式のID */
export type ULID = string;

/** ToDoのステータス */
export type TodoStatus = "untouched" | "in-progress" | "completed" | "archived";

/** フィルター用ステータス（"none"で全表示） */
export type FilterStatus = "none" | TodoStatus;

/** ソート種別 */
export type SortBy = "none" | "deadline" | "title";

/** ToDoアイテム */
export type ToDo = {
  id: ULID;
  title: string;
  status: TodoStatus;
  description?: string;
  deadline?: string;
};

/** ステータスの日本語ラベル */
export const STATUS_LABELS: Record<TodoStatus, string> = {
  untouched: "未着手",
  "in-progress": "進行中",
  completed: "完了",
  archived: "アーカイブ",
} as const;

/** ステータスの遷移先（アイコンクリック時の次ステータス） */
export const NEXT_STATUS: Record<TodoStatus, TodoStatus> = {
  untouched: "in-progress",
  "in-progress": "completed",
  completed: "archived",
  archived: "archived", // アーカイブは遷移なし
} as const;

