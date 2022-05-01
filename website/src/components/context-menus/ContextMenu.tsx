import {
    Menu,
    Typography,
    Divider,
    ListItemText,
    IconButton,
    ListItem,
} from "@mui/material";
import { NestedMenuItem } from "./NestedMenuItem";
import { StyledMenuItem } from "./StyledMenuItem";
import { ContextMenuBaseProps, ContextMenuShape } from "./types";

type Props = ContextMenuBaseProps & {
    menuObject: ContextMenuShape[][];
};
export const ContextMenu: React.FC<Props> = ({
    contextMenu,
    handleClose,
    menuObject,
}) => {
    return (
        <Menu
            open={contextMenu !== null}
            onClose={(e: any) => {
                if (e.stopPropagation) e.stopPropagation();
                handleClose();
            }}
            anchorReference="anchorPosition"
            sx={{}}
            PaperProps={{
                variant: "outlined",
                elevation: 1,
                sx: {
                    padding: 1,
                },
            }}
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            {menuObject.map((menuGroup, i, array) => {
                const menuItems: ContextMenuShape[] = menuGroup.filter(
                    item => item.visible
                );
                return (
                    menuItems.length > 0 && (
                        <div>
                            {menuItems.map(
                                (
                                    {
                                        label,
                                        disabled,
                                        color,
                                        icon,
                                        action,
                                        children,
                                    },
                                    i
                                ) =>
                                    children ? (
                                        <NestedMenuItem
                                            key={`${label}-${i}`}
                                            parentMenuOpen={
                                                contextMenu !== null
                                            }
                                            label={
                                                <Typography variant="body2">
                                                    {label}
                                                </Typography>
                                            }
                                        >
                                            {children.map((menuItem, index) => (
                                                <StyledMenuItem
                                                    //@ts-ignore
                                                    component={ListItem}
                                                    key={`${label}-${index}`}
                                                    sx={{
                                                        color: menuItem.color,
                                                        "&:hover": {
                                                            color: "white",
                                                            background: color,
                                                        },
                                                    }}
                                                    onClick={async e => {
                                                        e.stopPropagation();
                                                        await menuItem.action(
                                                            handleClose
                                                        );
                                                    }}
                                                    disabled={menuItem.disabled}
                                                    secondaryAction={
                                                        menuItem.icon && (
                                                            <IconButton
                                                                size="small"
                                                                disableRipple
                                                                sx={{
                                                                    "&:hover": {
                                                                        bgcolor:
                                                                            "transparent",
                                                                    },
                                                                }}
                                                            >
                                                                {menuItem.icon}
                                                            </IconButton>
                                                        )
                                                    }
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Typography
                                                                sx={{
                                                                    maxWidth:
                                                                        menuItem.icon
                                                                            ? "80%"
                                                                            : "100%",
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                }}
                                                                variant="body2"
                                                            >
                                                                {menuItem.label}
                                                            </Typography>
                                                        }
                                                    />
                                                </StyledMenuItem>
                                            ))}
                                        </NestedMenuItem>
                                    ) : (
                                        <StyledMenuItem
                                            //@ts-ignore
                                            component={ListItem}
                                            key={`${label}-${i}`}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                color,
                                                "&:hover": {
                                                    color: "white",
                                                    background: color,
                                                },
                                                "&:hover .make-white": {
                                                    color: "white",
                                                },
                                            }}
                                            onClick={async e => {
                                                e.stopPropagation();
                                                await action(handleClose);
                                            }}
                                            disabled={disabled}
                                            secondaryAction={
                                                icon && (
                                                    <IconButton
                                                        size="small"
                                                        disableRipple
                                                        sx={{
                                                            "&:hover": {
                                                                bgcolor:
                                                                    "transparent",
                                                            },
                                                        }}
                                                    >
                                                        {icon}
                                                    </IconButton>
                                                )
                                            }
                                        >
                                            <ListItemText
                                                sx={{
                                                    minWidth: 0,
                                                    width: "min-content",
                                                }}
                                                primary={
                                                    <Typography
                                                        sx={{
                                                            maxWidth: icon
                                                                ? "80%"
                                                                : "100%",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                        variant="body2"
                                                    >
                                                        {label}
                                                    </Typography>
                                                }
                                            />
                                        </StyledMenuItem>
                                    )
                            )}
                            {i !== array.length - 1 && <Divider />}
                        </div>
                    )
                );
            })}
        </Menu>
    );
};
