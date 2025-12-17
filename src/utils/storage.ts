import type { ToDo } from "../types";

const STORAGE_KEY = "modern-todo-list";

/**
 * LocalStorageからToDoリストを読み込む
 */
export function loadTodosFromStorage(): ToDo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const todos = JSON.parse(stored) as ToDo[];
    // マイグレーション: createdAtがない古いデータに対応
    return todos.map((todo) => ({
      ...todo,
      createdAt: todo.createdAt || new Date().toISOString(),
      priority: todo.priority || "none",
      tags: todo.tags || [],
    }));
  } catch (error) {
    console.error("Failed to load todos from storage:", error);
    return [];
  }
}

/**
 * LocalStorageにToDoリストを保存
 */
export function saveTodosToStorage(todos: ToDo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Failed to save todos to storage:", error);
  }
}

