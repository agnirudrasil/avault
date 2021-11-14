import { createContext, useState } from "react";
import { CreateInviteDialog } from "../src/components/dialogs/CreateInviteDialog";

export interface CreateInviteConfig {
    channel_id?: string;
}

export const CreateInviteDialogContext = createContext<{
    openDialog: (config?: CreateInviteConfig) => void;
}>({ openDialog: () => {} });

export const CreateInviteDialogProvider: React.FC = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<
        CreateInviteConfig | undefined
    >({
        channel_id: "",
    });

    const openDialog = (config?: CreateInviteConfig) => {
        setOpen(true);
        setDialogConfig(config);
    };

    return (
        <CreateInviteDialogContext.Provider value={{ openDialog }}>
            {open && (
                <CreateInviteDialog
                    open={open}
                    handleClose={() => setOpen(false)}
                    {...dialogConfig}
                />
            )}
            {children}
        </CreateInviteDialogContext.Provider>
    );
};
