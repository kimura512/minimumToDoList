import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "./TodoItem";
import { ToDo, TodoStatus } from "../types";

// テスト用のモック関数
const mockOnUpdateStatus = jest.fn();
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

// テスト用のToDo作成ヘルパー
const createTodo = (overrides: Partial<ToDo> = {}): ToDo => ({
  id: "test-id-001",
  title: "テストタスク",
  status: "untouched",
  ...overrides,
});

describe("TodoItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("表示", () => {
    it("タイトルが表示される", () => {
      const todo = createTodo({ title: "タスクのタイトル" });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText("タスクのタイトル")).toBeInTheDocument();
    });

    it("期限が表示される", () => {
      const todo = createTodo({ deadline: "2024-12-31" });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText("2024-12-31")).toBeInTheDocument();
    });

    it("詳細が表示される（短いテキスト）", () => {
      const todo = createTodo({ description: "詳細です" });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText("詳細です")).toBeInTheDocument();
    });

    it("詳細が省略表示される（長いテキスト）", () => {
      const todo = createTodo({
        description: "これはとても長い詳細テキストです",
      });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText("これはとても長い詳細…")).toBeInTheDocument();
    });
  });

  describe("ステータスアイコンのクリック", () => {
    it("未着手から進行中に変更される", async () => {
      const user = userEvent.setup();
      const todo = createTodo({ status: "untouched" });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const statusIconWrapper = screen.getByRole("listitem").querySelector(".status-icon-wrapper");
      await user.click(statusIconWrapper!);

      expect(mockOnUpdateStatus).toHaveBeenCalledWith("test-id-001", "in-progress");
    });

    it("進行中から完了に変更される", async () => {
      const user = userEvent.setup();
      const todo = createTodo({ status: "in-progress" });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const statusIconWrapper = screen.getByRole("listitem").querySelector(".status-icon-wrapper");
      await user.click(statusIconWrapper!);

      expect(mockOnUpdateStatus).toHaveBeenCalledWith("test-id-001", "completed");
    });

    it("完了からアーカイブに変更される", async () => {
      const user = userEvent.setup();
      const todo = createTodo({ status: "completed" });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const statusIconWrapper = screen.getByRole("listitem").querySelector(".status-icon-wrapper");
      await user.click(statusIconWrapper!);

      expect(mockOnUpdateStatus).toHaveBeenCalledWith("test-id-001", "archived");
    });

    it("アーカイブはクリックしても変化しない", async () => {
      const user = userEvent.setup();
      const todo = createTodo({ status: "archived" });
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const statusIconWrapper = screen.getByRole("listitem").querySelector(".status-icon-wrapper");
      await user.click(statusIconWrapper!);

      expect(mockOnUpdateStatus).not.toHaveBeenCalled();
    });
  });

  describe("編集ボタン", () => {
    it("編集ボタンクリックでonEditが呼ばれる", async () => {
      const user = userEvent.setup();
      const todo = createTodo();
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const buttons = screen.getByRole("listitem").querySelectorAll(".list-item-button");
      // 最初のボタンが編集
      await user.click(buttons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(todo);
    });
  });

  describe("削除ボタン", () => {
    it("削除ボタンクリックでonDeleteが呼ばれる", async () => {
      const user = userEvent.setup();
      const todo = createTodo();
      render(
        <TodoItem
          todo={todo}
          onUpdateStatus={mockOnUpdateStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const buttons = screen.getByRole("listitem").querySelectorAll(".list-item-button");
      // 2番目のボタンが削除
      await user.click(buttons[1]);

      expect(mockOnDelete).toHaveBeenCalledWith("test-id-001");
    });
  });
});

