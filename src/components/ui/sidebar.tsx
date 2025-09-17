import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const railVariants = cva("peer fixed inset-y-0 left-0 z-50 hidden h-full bg-sidebar md:flex", {
  variants: {
    collapsible: {
      icon: "w-12",
      "responsive-icon": "w-12 lg:w-64",
      responsive: "w-64",
    },
  },
  defaultVariants: {
    collapsible: "responsive",
  },
});

const SidebarRail = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & VariantProps<typeof railVariants>>(
  ({ className, collapsible, ...props }, ref) => {
    const { open } = useSidebar();

    return (
      <div
        ref={ref}
        data-state={open ? "expanded" : "collapsed"}
        className={cn(railVariants({ collapsible }), className)}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    collapsible?: "icon" | "responsive-icon" | "responsive";
  }
>(({ collapsible = "responsive", className, style, ...props }, ref) => {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className={cn("w-72 bg-sidebar p-0", className)}
          style={{
            ...style,
            width: SIDEBAR_WIDTH_MOBILE,
          }}
          {...props}
        />
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      data-state={open ? "expanded" : "collapsed"}
      className={cn("bg-sidebar", className)}
      style={{
        ...style,
        width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON,
      }}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground", className)}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-12 shrink-0 items-center gap-2 px-3", className)} {...props} />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar, isMobile } = useSidebar();

    if (isMobile) {
      return (
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          className={cn("shrink-0", className)}
          onClick={toggleSidebar}
          {...props}
        >
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              size="icon"
              className={cn("shrink-0", className)}
              onClick={toggleSidebar}
              {...props}
            >
              <PanelLeft />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Toggle Sidebar ({SIDEBAR_KEYBOARD_SHORTCUT})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-3", className)} {...props} />
));
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => (
    <div className="px-3">
      <Input ref={ref} className={cn("h-8", className)} {...props} />
    </div>
  ),
);
SidebarInput.displayName = "SidebarInput";

const SidebarSeparator = React.forwardRef<HTMLHRElement, React.ComponentProps<typeof Separator>>(
  ({ className, ...props }, ref) => <Separator ref={ref} className={cn("my-2", className)} {...props} />,
);
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-auto flex flex-col", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    collapsible?: "icon" | "responsive-icon" | "responsive";
  }
>(({ collapsible = "responsive", className, ...props }, ref) => {
  const { open } = useSidebar();

  return (
    <div
      ref={ref}
      data-collapsible={collapsible}
      data-state={open ? "expanded" : "collapsed"}
      className={cn("group flex flex-col", className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "truncate px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted-foreground",
        "group-data-[state=collapsed]:invisible group-data-[state=collapsed]:h-0 group-data-[state=collapsed]:p-0",
        className,
      )}
      {...props}
    />
  ),
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props} />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        "group-data-[state=collapsed]:invisible",
        className,
      )}
      {...props}
    />
  ),
);
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-col gap-0.5 px-3", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ ...props }, ref) => (
  <li ref={ref} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    isActive?: boolean;
  }
>(({ asChild = false, isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        "flex h-8 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        "group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuBadge = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "ml-auto shrink-0 rounded-md bg-sidebar-accent px-1.5 py-0.5 text-xs font-medium text-sidebar-accent-foreground",
        "group-data-[state=collapsed]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "ml-auto h-7 w-7 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        "group-data-[state=collapsed]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    count?: number;
    subCount?: number;
  }
>(({ count = 5, subCount = 0, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-0.5 px-3", className)} {...props}>
      {Array.from({ length: count }).map((_, i) =>
        subCount > 0 ? (
          <div key={i} className="flex flex-col gap-0.5">
            <Skeleton className="h-8 w-full" />
            <div className="ml-5 flex flex-col gap-0.5 border-l border-sidebar-border pl-4">
              {Array.from({ length: subCount }).map((_, j) => (
                <Skeleton key={j} className="h-7 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Skeleton key={i} className="h-8 w-full" />
        ),
      )}
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ ...props }, ref) => (
  <li ref={ref} {...props} />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
};
