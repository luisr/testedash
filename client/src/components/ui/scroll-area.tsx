import { Root, Viewport, Scrollbar, Thumb } from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const ScrollArea = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, children, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </Viewport>
    <ScrollBar />
    <Scrollbar orientation="horizontal" />
  </Root>
));
ScrollArea.displayName = Root.displayName;

const ScrollBar = forwardRef<
  React.ElementRef<typeof Scrollbar>,
  React.ComponentPropsWithoutRef<typeof Scrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <Thumb className="relative flex-1 rounded-full bg-border" />
  </Scrollbar>
));
ScrollBar.displayName = Scrollbar.displayName;

export { ScrollArea, ScrollBar };