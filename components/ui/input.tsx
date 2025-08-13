import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface DefaultInputProps extends TextInputProps {
	className?: string;
	placeholderClassName?: string;
}

interface BorderlessInputProps extends TextInputProps {
	className?: string;
	placeholderClassName?: string;
}

const DefaultInput = React.forwardRef<
	React.ComponentRef<typeof TextInput>,
	DefaultInputProps
>(({ className, placeholderClassName, ...props }, ref) => {
	return (
		<TextInput
			ref={ref}
			className={cn(
				"web:flex h-10 native:h-12 web:w-full rounded-lg border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 bg-white",
				props.editable === false && "opacity-50 web:cursor-not-allowed",
				className,
			)}
			placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
			{...props}
		/>
	);
});

const BorderlessInput = React.forwardRef<
	React.ComponentRef<typeof TextInput>,
	BorderlessInputProps
>(({ className, placeholderClassName, ...props }, ref) => {
	return (
		<TextInput
			ref={ref}
			className={cn(
				"web:flex h-16 native:h-20 bg-transparent web:py-3 text-3xl text-foreground placeholder:text-muted-foreground font-serif font-medium",
				props.editable === false && "opacity-50 web:cursor-not-allowed",
				className,
			)}
			placeholderClassName={cn(
				"text-muted-foreground font-serif font-medium text-center",
				placeholderClassName,
			)}
			{...props}
		/>
	);
});

DefaultInput.displayName = "DefaultInput";
BorderlessInput.displayName = "BorderlessInput";

// Alias for backward compatibility
const Input = DefaultInput;
Input.displayName = "Input";

export { DefaultInput, BorderlessInput, Input };
