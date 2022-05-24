import { useState } from "react";

export interface ContextMenu {
    mouseX: number;
    mouseY: number;
}

export const useContextMenu = () => {
    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX - 2,
                      mouseY: event.clientY - 4,
                  }
                : null
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    return { contextMenu, handleContextMenu, handleClose };
};
