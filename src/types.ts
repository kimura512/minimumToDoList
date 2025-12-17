/**
 * ToDoリストアプリの型定義
 */

/** ULID形式のID */
export type ULID = string;

/** ToDoのステータス */
export type TodoStatus = "untouched" | "in-progress" | "completed" | "archived";

/** 優先度 */
export type Priority = "high" | "medium" | "low" | "none";

/** フィルター用ステータス（"none"で全表示） */
export type FilterStatus = "none" | TodoStatus;

/** ソート種別 */
export type SortBy = "none" | "deadline" | "title" | "priority" | "created";

/** ToDoアイテム */
export type ToDo = {
  id: ULID;
  title: string;
  status: TodoStatus;
  description?: string;
  deadline?: string;
  priority?: Priority;
  tags?: string[];
  createdAt: string; // ISO 8601形式
  updatedAt?: string; // ISO 8601形式
};

/** ステータスの日本語ラベル */
export const STATUS_LABELS: Record<TodoStatus, string> = {
  untouched: "未着手",
  "in-progress": "進行中",
  completed: "完了",
  archived: "アーカイブ",
} as const;

/** 優先度の日本語ラベル */
export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
  none: "なし",
} as const;

/** 優先度の色 */
export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#ef4444", // red-500
  medium: "#f59e0b", // amber-500
  low: "#10b981", // emerald-500
  none: "#6b7280", // gray-500
} as const;

/** ステータスの遷移先（アイコンクリック時の次ステータス） */
export const NEXT_STATUS: Record<TodoStatus, TodoStatus> = {
  untouched: "in-progress",
  "in-progress": "completed",
  completed: "archived",
  archived: "archived", // アーカイブは遷移なし
} as const;
