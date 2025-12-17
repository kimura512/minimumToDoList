import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToDoListApp from "./ToDoList";

describe("ToDoListApp 統合テスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("初期表示", () => {
    it("タイトルが表示される", () => {
      render(<ToDoListApp />);
      expect(screen.getByText("Minimum To Do List")).toBeInTheDocument();
    });

    it("入力欄が表示される", () => {
      render(<ToDoListApp />);
      expect(screen.getByPlaceholderText("新規 To Do")).toBeInTheDocument();
    });

    it("追加ボタンが表示される", () => {
      render(<ToDoListApp />);
      expect(screen.getByText("追加")).toBeInTheDocument();
    });

    it("フィルターセレクトが表示される", () => {
      render(<ToDoListApp />);
      expect(screen.getByDisplayValue("フィルターなし")).toBeInTheDocument();
    });

    it("ソートセレクトが表示される", () => {
      render(<ToDoListApp />);
      expect(screen.getByDisplayValue("ソートなし")).toBeInTheDocument();
    });

    it("3つのステータスリストが表示される", () => {
      render(<ToDoListApp />);
      expect(screen.getByRole("heading", { name: "未着手" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "進行中" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "完了" })).toBeInTheDocument();
    });

    it("アーカイブリストは初期表示されない", () => {
      render(<ToDoListApp />);
      // アーカイブのh4タグがないことを確認（selectのoptionにはある）
      expect(screen.queryByRole("heading", { name: "アーカイブ" })).not.toBeInTheDocument();
    });
  });

  describe("ToDo追加", () => {
    it("テキストを入力して追加ボタンで追加できる", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "新しいタスク");
      await user.click(screen.getByText("追加"));

      expect(screen.getByText("新しいタスク")).toBeInTheDocument();
    });

    it("Enterキーで追加できる", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "Enterで追加{enter}");

      expect(screen.getByText("Enterで追加")).toBeInTheDocument();
    });

    it("追加後に入力欄がクリアされる", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "テスト{enter}");

      expect(input).toHaveValue("");
    });

    it("空のテキストでは追加されない", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      await user.click(screen.getByText("追加"));

      // リストアイテムが存在しないことを確認
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });

    it("空白のみでは追加されない", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "   {enter}");

      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });

    it("追加されたタスクは未着手リストに入る", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "未着手タスク{enter}");

      const untouchedList = screen.getByRole("heading", { name: "未着手" }).closest(".list") as HTMLElement;
      expect(within(untouchedList).getByText("未着手タスク")).toBeInTheDocument();
    });
  });

  describe("ステータス変更", () => {
    it("未着手→進行中に変更できる", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      // タスク追加
      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "ステータス変更テスト{enter}");

      // ステータスアイコンをクリック
      const listItem = screen.getByText("ステータス変更テスト").closest("li");
      const statusIcon = listItem!.querySelector(".list-item-status");
      await user.click(statusIcon!);

      // 進行中リストに移動したことを確認
      const inProgressList = screen.getByRole("heading", { name: "進行中" }).closest(".list") as HTMLElement;
      expect(
        within(inProgressList).getByText("ステータス変更テスト")
      ).toBeInTheDocument();
    });
  });

  describe("編集モーダル", () => {
    it("編集ボタンクリックでモーダルが開く", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      // タスク追加
      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "編集テスト{enter}");

      // 編集ボタンをクリック
      const listItem = screen.getByText("編集テスト").closest("li");
      const editButton = listItem!.querySelectorAll(".list-item-button")[0];
      await user.click(editButton);

      // モーダルが表示されることを確認
      expect(screen.getByText("編集")).toBeInTheDocument();
    });

    it("キャンセルでモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      // タスク追加
      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "編集テスト{enter}");

      // 編集モーダルを開く
      const listItem = screen.getByText("編集テスト").closest("li");
      const editButton = listItem!.querySelectorAll(".list-item-button")[0];
      await user.click(editButton);

      // キャンセル
      await user.click(screen.getByText("キャンセル"));

      // モーダルが閉じることを確認
      expect(screen.queryByRole("heading", { name: "編集" })).not.toBeInTheDocument();
    });

    it("編集して保存すると内容が更新される", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      // タスク追加
      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "元のタイトル{enter}");

      // 編集モーダルを開く
      const listItem = screen.getByText("元のタイトル").closest("li");
      const editButton = listItem!.querySelectorAll(".list-item-button")[0];
      await user.click(editButton);

      // タイトルを変更
      const titleInput = screen.getByDisplayValue("元のタイトル");
      await user.clear(titleInput);
      await user.type(titleInput, "変更後タイトル");

      // 保存
      await user.click(screen.getByText("保存"));

      // 更新されたことを確認
      expect(screen.getByText("変更後タイトル")).toBeInTheDocument();
      expect(screen.queryByText("元のタイトル")).not.toBeInTheDocument();
    });
  });

  describe("削除", () => {
    it("削除ボタンクリックでタスクが削除される", async () => {
      const user = userEvent.setup();
      // confirmをtrueを返すようにモック（setupTests.tsで設定済み）
      render(<ToDoListApp />);

      // タスク追加
      const input = screen.getByPlaceholderText("新規 To Do");
      await user.type(input, "削除テスト{enter}");

      expect(screen.getByText("削除テスト")).toBeInTheDocument();

      // 削除ボタンをクリック
      const listItem = screen.getByText("削除テスト").closest("li");
      const deleteButton = listItem!.querySelectorAll(".list-item-button")[1];
      await user.click(deleteButton);

      // 削除されたことを確認
      expect(screen.queryByText("削除テスト")).not.toBeInTheDocument();
    });
  });

  describe("フィルター", () => {
    it("フィルターセレクトで選択を変更できる", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      const filterSelect = screen.getByDisplayValue("フィルターなし");
      await user.selectOptions(filterSelect, "untouched");

      expect(filterSelect).toHaveValue("untouched");
    });

    it("アーカイブでフィルターするとアーカイブリストが表示される", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      // アーカイブでフィルター
      const filterSelect = screen.getByDisplayValue("フィルターなし");
      await user.selectOptions(filterSelect, "archived");

      // アーカイブリストが表示される（h4タグとして）
      expect(screen.getByRole("heading", { name: "アーカイブ" })).toBeInTheDocument();
    });
  });

  describe("ソート", () => {
    it("ソートセレクトで選択を変更できる", async () => {
      const user = userEvent.setup();
      render(<ToDoListApp />);

      const sortSelect = screen.getByDisplayValue("ソートなし");
      await user.selectOptions(sortSelect, "title");

      expect(sortSelect).toHaveValue("title");
    });
  });
});

