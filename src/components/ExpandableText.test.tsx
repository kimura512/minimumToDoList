import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandableText } from "./ExpandableText";

describe("ExpandableText", () => {
  it("テキストがない場合は何も表示しない", () => {
    const { container } = render(<ExpandableText />);
    expect(container).toBeEmptyDOMElement();
  });

  it("空文字の場合は何も表示しない", () => {
    const { container } = render(<ExpandableText text="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("limit以下のテキストはそのまま表示する", () => {
    render(<ExpandableText text="短いよ" limit={10} />);
    expect(screen.getByText("短いよ")).toBeInTheDocument();
  });

  it("limit以下のテキストにはtitle属性がない", () => {
    render(<ExpandableText text="短いよ" limit={10} />);
    const element = screen.getByText("短いよ");
    expect(element).not.toHaveAttribute("title");
  });

  it("limit超過のテキストは省略表示される", () => {
    const longText = "これはとても長いテキストです";
    render(<ExpandableText text={longText} limit={5} />);
    expect(screen.getByText("これはとて…")).toBeInTheDocument();
  });

  it("limit超過のテキストにはtitle属性がある", () => {
    const longText = "これはとても長いテキストです";
    render(<ExpandableText text={longText} limit={5} />);
    const element = screen.getByText("これはとて…");
    expect(element).toHaveAttribute("title", "クリックで全文表示");
  });

  it("クリックで全文表示になる", async () => {
    const user = userEvent.setup();
    const longText = "これはとても長いテキストです";
    render(<ExpandableText text={longText} limit={5} />);

    const element = screen.getByText("これはとて…");
    await user.click(element);

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it("再度クリックで省略表示に戻る", async () => {
    const user = userEvent.setup();
    const longText = "これはとても長いテキストです";
    render(<ExpandableText text={longText} limit={5} />);

    const element = screen.getByText("これはとて…");
    await user.click(element);
    expect(screen.getByText(longText)).toBeInTheDocument();

    await user.click(screen.getByText(longText));
    expect(screen.getByText("これはとて…")).toBeInTheDocument();
  });

  it("classNameが適用される", () => {
    render(
      <ExpandableText text="テスト" className="custom-class" limit={10} />
    );
    const element = screen.getByText("テスト");
    expect(element).toHaveClass("custom-class");
  });

  it("短いテキストはクリックしても変化しない", async () => {
    const user = userEvent.setup();
    render(<ExpandableText text="短い" limit={10} />);

    const element = screen.getByText("短い");
    await user.click(element);

    expect(screen.getByText("短い")).toBeInTheDocument();
  });
});

