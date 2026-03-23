import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("#/components/ui/field", () => ({
	Field: ({ children, id }: { children: React.ReactNode; id?: string }) => (
		<div data-testid="field" id={id}>
			{children}
		</div>
	),
	FieldControl: ({
		children,
		invalid,
	}: {
		children: React.ReactNode;
		invalid?: boolean;
	}) => (
		<div data-testid="field-control" data-invalid={invalid}>
			{children}
		</div>
	),
	FieldLabel: ({ children }: { children: React.ReactNode }) => (
		<label>{children}</label>
	),
}));

vi.mock("#/components/ui/label", () => ({
	Label: ({
		children,
		htmlFor,
	}: {
		children: React.ReactNode;
		htmlFor?: string;
	}) => (
		<label htmlFor={htmlFor}>{children}</label>
	),
}));

vi.mock("#/components/ui/input", () => ({
	Input: (props: Record<string, unknown>) => <input {...props} />,
}));

vi.mock("#/components/ui/button", () => ({
	Button: (props: Record<string, unknown>) => <button {...props} />,
}));

import { TranslatorInputForm } from "./TranslatorInputForm";

const baseProps = {
	sourceLanguage: "en",
	onSourceLanguageChange: vi.fn(),
};

describe("TranslatorInputForm", () => {
	it("renders default state", () => {
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput=""
				loading={false}
				error={null}
				translationCount={0}
				onTranslate={vi.fn()}
				onBlur={vi.fn()}
			/>,
		);
		expect(container.textContent).toContain("Text to translate");
		expect(container.textContent).toContain("Translate phrase");
	});

	it("calls onTranslate when button clicked", () => {
		const onTranslate = vi.fn();
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput="hello"
				loading={false}
				error={null}
				translationCount={0}
				onTranslate={onTranslate}
				onBlur={vi.fn()}
			/>,
		);
		const input = container.querySelector("input[type=text]");
		const buttons = container.querySelectorAll("button");
		const translateBtn = [...buttons].find((b) =>
			b.textContent?.includes("Translate phrase"),
		);
		fireEvent.change(input!, { target: { value: "hello" } });
		fireEvent.input(input!);
		fireEvent.click(translateBtn!);
		expect(onTranslate).toHaveBeenCalledWith("hello");
	});

	it("calls onTranslate on Enter key", () => {
		const onTranslate = vi.fn();
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput=""
				loading={false}
				error={null}
				translationCount={0}
				onTranslate={onTranslate}
				onBlur={vi.fn()}
			/>,
		);
		const input = container.querySelector("input[type=text]");
		fireEvent.change(input!, { target: { value: "test" } });
		fireEvent.keyDown(input!, { key: "Enter" });
		expect(onTranslate).toHaveBeenCalledWith("test");
	});

	it("disables button when loading", () => {
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput="hello"
				loading={true}
				error={null}
				translationCount={0}
				onTranslate={vi.fn()}
				onBlur={vi.fn()}
			/>,
		);
		const buttons = container.querySelectorAll("button");
		const translateBtn = [...buttons].find((b) =>
			b.textContent?.includes("Translating"),
		);
		expect(translateBtn?.hasAttribute("disabled")).toBe(true);
		expect(container.textContent).toContain("Translating...");
	});

	it("disables button when input is empty", () => {
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput=""
				loading={false}
				error={null}
				translationCount={0}
				onTranslate={vi.fn()}
				onBlur={vi.fn()}
			/>,
		);
		const translateBtn = [...container.querySelectorAll("button")].find((b) =>
			b.textContent?.includes("Translate phrase"),
		);
		expect(translateBtn?.hasAttribute("disabled")).toBe(true);
	});

	it("shows translation count when > 0", () => {
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput="hello"
				loading={false}
				error={null}
				translationCount={3}
				onTranslate={vi.fn()}
				onBlur={vi.fn()}
			/>,
		);
		expect(container.textContent).toContain("3 translations are ready");
	});

	it("shows singular when translationCount is 1", () => {
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput="hello"
				loading={false}
				error={null}
				translationCount={1}
				onTranslate={vi.fn()}
				onBlur={vi.fn()}
			/>,
		);
		expect(container.textContent).toContain("1 translation is ready");
	});

	it("shows error message", () => {
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput=""
				loading={false}
				error="Enter some text"
				translationCount={0}
				onTranslate={vi.fn()}
				onBlur={vi.fn()}
			/>,
		);
		expect(container.textContent).toContain("Enter some text");
	});

	it("calls onBlur with input value", () => {
		const onBlur = vi.fn();
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput=""
				loading={false}
				error={null}
				translationCount={0}
				onTranslate={vi.fn()}
				onBlur={onBlur}
			/>,
		);
		const input = container.querySelector("input[type=text]");
		fireEvent.change(input!, { target: { value: "blurred" } });
		fireEvent.blur(input!);
		expect(onBlur).toHaveBeenCalledWith("blurred");
	});

	it("calls onRetry when Retry button visible", () => {
		const onRetry = vi.fn();
		const { container } = render(
			<TranslatorInputForm
				{...baseProps}
				initialInput="hi"
				loading={false}
				error="Failed"
				translationCount={0}
				onTranslate={vi.fn()}
				onBlur={vi.fn()}
				onRetry={onRetry}
			/>,
		);
		const retry = [...container.querySelectorAll("button")].find((b) =>
			b.textContent?.includes("Retry"),
		);
		fireEvent.click(retry!);
		expect(onRetry).toHaveBeenCalled();
	});
});
