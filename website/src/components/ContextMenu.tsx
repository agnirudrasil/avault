import { Divider, Menu, MenuItem } from "@mui/material";
import type { ContextMenu as ContextMenuType } from "../../hooks/useContextMenu";

interface Props {
    contextMenu: ContextMenuType | null;
    handleClose: () => void;
    contextMenuItems:
        | "divider"[]
        | {
              title: string;
              icon?: React.ReactNode;
              color: "error" | "info";
              disabled: boolean;
              onClick: () => void;
          }[];
}

export const ContextMenu: React.FC<Props> = ({
    contextMenu,
    handleClose,
    contextMenuItems,
}) => {
    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            {contextMenuItems.map((item, index, array) =>
                item === "divider"
                    ? !(array[index - 1] as any).disabled && <Divider />
                    : !item.disabled && (
                          <MenuItem
                              sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                              }}
                              color={item.color === "error" ? "red" : undefined}
                              onClick={() => {
                                  item.onClick();
                                  handleClose();
                              }}
                          >
                              {item.title}
                              {item.icon}
                          </MenuItem>
                      )
            )}
        </Menu>
    );
};
