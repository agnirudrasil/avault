import { ContextMenu } from "../../../hooks/useContextMenu";

export interface ContextMenuBaseProps {
    contextMenu: ContextMenu | null;
    handleClose: () => void;
}

export type ContextMenuShape = {
    visible: boolean;
    label: string;
    action: (handleClose: () => any) => any;
    icon?: React.ReactNode;
    disabled?: boolean;
    color?: string;
    children?: Omit<ContextMenuShape, "children">[];
};
