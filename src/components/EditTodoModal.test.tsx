import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditTodoModal } from "./EditTodoModal";
import { ToDo } from "../types";

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

const createTodo = (overrides: Partial<ToDo> = {}): ToDo => ({
  id: "test-id-001",
  title: "テストタスク",
  status: "untouched",
  createdAt: new Date().toISOString(),
  priority: "none",
  tags: [],
  ...overrides,
});

describe("EditTodoModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("初期表示", () => {
    it("タイトルが表示される", () => {
      render(
        <EditTodoModal
          todo={createTodo({ title: "初期タイトル" })}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByDisplayValue("初期タイトル")).toBeInTheDocument();
    });

    it("ステータスが選択されている", () => {
      render(
        <EditTodoModal
          todo={createTodo({ status: "in-progress" })}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByRole("combobox")).toHaveValue("in-progress");
    });

    it("詳細が表示される", () => {
      render(
        <EditTodoModal
          todo={createTodo({ description: "詳細テキスト" })}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByDisplayValue("詳細テキスト")).toBeInTheDocument();
    });

    it("期限が表示される", () => {
      render(
        <EditTodoModal
          todo={createTodo({ deadline: "2024-12-31" })}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByDisplayValue("2024-12-31")).toBeInTheDocument();
    });

    it("モーダルタイトルが表示される", () => {
      render(
        <EditTodoModal
          todo={createTodo()}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      expect(screen.getByText("編集")).toBeInTheDocument();
    });
  });

  describe("編集操作", () => {
    it("タイトルを変更できる", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo({ title: "元のタイトル" })}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByDisplayValue("元のタイトル");
      await user.clear(input);
      await user.type(input, "新しいタイトル");

      expect(screen.getByDisplayValue("新しいタイトル")).toBeInTheDocument();
    });

    it("ステータスを変更できる", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo({ status: "untouched" })}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "completed");

      expect(select).toHaveValue("completed");
    });

    it("詳細を変更できる", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo({ description: "元の詳細" })}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByDisplayValue("元の詳細");
      await user.clear(textarea);
      await user.type(textarea, "新しい詳細");

      expect(screen.getByDisplayValue("新しい詳細")).toBeInTheDocument();
    });
  });

  describe("保存操作", () => {
    it("保存ボタンでonSaveが呼ばれる", async () => {
      const user = userEvent.setup();
      const todo = createTodo({ title: "テスト" });
      render(
        <EditTodoModal todo={todo} onClose={mockOnClose} onSave={mockOnSave} />
      );

      await user.click(screen.getByText("保存"));

      expect(mockOnSave).toHaveBeenCalledWith({
        ...todo,
        title: "テスト",
        description: undefined,
        deadline: undefined,
      });
    });

    it("変更した内容で保存される", async () => {
      const user = userEvent.setup();
      const todo = createTodo();
      render(
        <EditTodoModal todo={todo} onClose={mockOnClose} onSave={mockOnSave} />
      );

      const titleInput = screen.getByDisplayValue("テストタスク");
      await user.clear(titleInput);
      await user.type(titleInput, "変更後タイトル");

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "completed");

      await user.click(screen.getByText("保存"));

      expect(mockOnSave).toHaveBeenCalledWith({
        ...todo,
        title: "変更後タイトル",
        status: "completed",
        description: undefined,
        deadline: undefined,
      });
    });

    it("タイトルが空の場合は保存されない", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo()}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByDisplayValue("テストタスク");
      await user.clear(input);
      await user.click(screen.getByText("保存"));

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("タイトルが空白のみの場合は保存されない", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo()}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByDisplayValue("テストタスク");
      await user.clear(input);
      await user.type(input, "   ");
      await user.click(screen.getByText("保存"));

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe("キャンセル操作", () => {
    it("キャンセルボタンでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo()}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      await user.click(screen.getByText("キャンセル"));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("オーバーレイクリックでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo()}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const overlay = document.querySelector(".modal-overlay");
      await user.click(overlay!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("モーダル内クリックではonCloseが呼ばれない", async () => {
      const user = userEvent.setup();
      render(
        <EditTodoModal
          todo={createTodo()}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const content = document.querySelector(".modal-content");
      await user.click(content!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});

