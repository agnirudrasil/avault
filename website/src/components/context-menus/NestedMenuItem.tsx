import { ChevronRight } from "@mui/icons-material";
import {
    MenuItemProps,
    MenuProps,
    Menu,
    ListItem,
    IconButton,
} from "@mui/material";
import { forwardRef, useRef, useImperativeHandle, useState } from "react";
import { StyledMenuItem } from "./StyledMenuItem";

export interface NestedMenuItemProps extends Omit<MenuItemProps, "button"> {
    parentMenuOpen: boolean;
    component?: React.ElementType;
    label?: React.ReactNode;
    rightIcon?: React.ReactNode;
    ContainerProps?: React.HTMLAttributes<HTMLElement> &
        React.RefAttributes<HTMLElement | null>;
    MenuProps?: Omit<MenuProps, "children">;
    button?: true | undefined;
}

export const NestedMenuItem = forwardRef<
    HTMLLIElement | null,
    NestedMenuItemProps
>((props, ref) => {
    const {
        parentMenuOpen,
        component = "div",
        label,
        rightIcon = <ChevronRight />,
        children,
        className,
        tabIndex: tabIndexProp,
        MenuProps = {},
        ContainerProps: ContainerPropsProp = {},
        ...MenuItemProps
    } = props;

    const { ref: containerRefProp, ...ContainerProps } = ContainerPropsProp;

    const menuItemRef = useRef<HTMLLIElement>(null);
    useImperativeHandle(ref, () => menuItemRef.current!);

    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(containerRefProp, () => containerRef.current);

    const menuContainerRef = useRef<HTMLDivElement>(null);

    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        setIsSubMenuOpen(true);
        if (ContainerProps?.onMouseEnter) {
            ContainerProps.onMouseEnter(event);
        }
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
        setIsSubMenuOpen(false);

        if (ContainerProps?.onMouseLeave) {
            ContainerProps.onMouseLeave(event);
        }
    };

    // Check if any immediate children are active
    const isSubmenuFocused = () => {
        const active = containerRef.current?.ownerDocument?.activeElement;
        for (const child of menuContainerRef.current?.children ?? []) {
            if (child === active) {
                return true;
            }
        }
        return false;
    };

    const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
        if (event.target === containerRef.current) {
            setIsSubMenuOpen(true);
        }

        if (ContainerProps?.onFocus) {
            ContainerProps.onFocus(event);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            return;
        }

        if (isSubmenuFocused()) {
            event.stopPropagation();
        }

        const active = containerRef.current?.ownerDocument?.activeElement;

        if (event.key === "ArrowLeft" && isSubmenuFocused()) {
            containerRef.current?.focus();
        }

        if (
            event.key === "ArrowRight" &&
            event.target === containerRef.current &&
            event.target === active
        ) {
            const firstChild = menuContainerRef.current?.children[0] as
                | HTMLElement
                | undefined;
            firstChild?.focus();
        }
    };

    const open = isSubMenuOpen && parentMenuOpen;

    // Root element must have a `tabIndex` attribute for keyboard navigation
    let tabIndex;
    if (!props.disabled) {
        tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1;
    }

    return (
        <div
            {...ContainerProps}
            ref={containerRef}
            onFocus={handleFocus}
            tabIndex={tabIndex}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
        >
            <StyledMenuItem
                component={ListItem}
                sx={{
                    bgcolor: open ? "primary.dark" : undefined,
                }}
                {...MenuItemProps}
                ref={menuItemRef}
                //@ts-ignore
                secondaryAction={
                    (
                        <IconButton
                            edge="end"
                            size="small"
                            disableRipple
                            sx={{
                                "&:hover": {
                                    bgcolor: "transparent",
                                },
                            }}
                        >
                            {rightIcon}
                        </IconButton>
                    ) as any
                }
            >
                {label}
            </StyledMenuItem>
            <Menu
                PaperProps={{
                    variant: "outlined",
                    sx: { p: 0.5 },
                }}
                style={{ pointerEvents: "none" }}
                anchorEl={menuItemRef.current}
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "left",
                }}
                open={open}
                autoFocus={false}
                disableAutoFocus
                disableEnforceFocus
                onClose={() => {
                    setIsSubMenuOpen(false);
                }}
            >
                <div ref={menuContainerRef} style={{ pointerEvents: "auto" }}>
                    {children}
                </div>
            </Menu>
        </div>
    );
});
