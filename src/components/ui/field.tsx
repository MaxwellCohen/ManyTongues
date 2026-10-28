import {
	Children,
	type ComponentPropsWithoutRef,
	cloneElement,
	createContext,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useContext,
	useId,
} from "react";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils";

type FieldContextValue = {
	fieldId: string;
	descriptionId: string;
	messageId: string;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export const fieldLabelClassName =
	"mb-1.5 block font-mono text-xs font-medium text-sea-ink-soft";
const fieldDescriptionClassName = "mt-1 font-mono text-xs text-muted-ink";
const fieldMessageClassName = "mt-1 font-mono text-sm text-neon-pink";

type FieldProps = ComponentPropsWithoutRef<"div"> & {
	id?: string;
};

function useFieldContext(partName: string) {
	const context = useContext(FieldContext);

	if (!context) {
		throw new Error(`${partName} must be used within a Field.`);
	}

	return context;
}

export function Field({ id, className, ...props }: FieldProps) {
	const reactId = useId();
	const fieldId = id ?? reactId;
	const value = {
		fieldId,
		descriptionId: `${fieldId}-description`,
		messageId: `${fieldId}-message`,
	};

	return (
		<FieldContext.Provider value={value}>
			<div className={cn("block", className)} {...props} />
		</FieldContext.Provider>
	);
}

export function FieldLabel({
	className,
	...props
}: ComponentPropsWithoutRef<"label">) {
	const { fieldId } = useFieldContext("FieldLabel");

	return (
		<Label
			className={cn(fieldLabelClassName, className)}
			htmlFor={props.htmlFor ?? fieldId}
			{...props}
		/>
	);
}

type FieldControlProps = {
	children: ReactElement;
	invalid?: boolean;
	describedBy?: string;
};

export function FieldControl({
	children,
	invalid = false,
	describedBy,
}: FieldControlProps) {
	const { fieldId, descriptionId, messageId } = useFieldContext("FieldControl");
	const child = Children.only(children);

	if (!isValidElement(child)) {
		return child;
	}

	const ariaDescribedBy = describedBy ?? `${descriptionId} ${messageId}`;
	const prev = child.props as {
		id?: string;
		"aria-describedby"?: string;
		"aria-invalid"?: boolean;
	};

	return cloneElement(child, {
		id: prev.id ?? fieldId,
		"aria-describedby": prev["aria-describedby"] ?? ariaDescribedBy,
		"aria-invalid": prev["aria-invalid"] ?? (invalid || undefined),
	} as Record<string, unknown>);
}

export function FieldDescription({
	className,
	children,
	...props
}: ComponentPropsWithoutRef<"p">) {
	const { descriptionId } = useFieldContext("FieldDescription");

	if (!children) return null;

	return (
		<p
			className={cn(fieldDescriptionClassName, className)}
			id={descriptionId}
			{...props}
		>
			{children as ReactNode}
		</p>
	);
}

export function FieldMessage({
	className,
	children,
	...props
}: ComponentPropsWithoutRef<"p">) {
	const { messageId } = useFieldContext("FieldMessage");

	if (!children) return null;

	return (
		<p
			className={cn(fieldMessageClassName, className)}
			id={messageId}
			{...props}
		>
			{children as ReactNode}
		</p>
	);
}
