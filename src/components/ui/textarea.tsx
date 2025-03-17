
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Merge the provided ref with our internal one
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Auto-resize function
    const autoResize = React.useCallback(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, []);

    // Setup resize observers and event listeners
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Initial resize
        autoResize();
        
        // Add event listeners for content changes
        textarea.addEventListener('input', autoResize);
        
        // Create a ResizeObserver to handle container size changes
        const resizeObserver = new ResizeObserver(autoResize);
        resizeObserver.observe(textarea);
        
        return () => {
          textarea.removeEventListener('input', autoResize);
          resizeObserver.disconnect();
        };
      }
    }, [autoResize]);

    // Handle initial content and prop changes
    React.useEffect(() => {
      autoResize();
    }, [props.value, autoResize]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-pre-wrap select-text",
          className
        )}
        ref={textareaRef}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
