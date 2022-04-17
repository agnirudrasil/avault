import { createContext, useState } from "react";
import { CreateChannelDialog } from "../src/components/dialogs/CreateChannelDialog";

export interface CreateChannelConfig {
    guild_id?: string;
    parent_id?: string;
    type: "GUILD_TEXT" | "GUILD_CATEGORY" | "GUILD_VOICE";
}

export const CreateChannelDialogContext = createContext<{
    openDialog: (config: CreateChannelConfig) => void;
}>({ openDialog: () => {} });

export const CreateChannelDialogProvider: React.FC = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<CreateChannelConfig>({
        type: "GUILD_TEXT",
    });

    const openDialog = (config: CreateChannelConfig) => {
        setOpen(true);
        setDialogConfig(config);
    };

    return (
        <CreateChannelDialogContext.Provider value={{ openDialog }}>
            {open && (
                <CreateChannelDialog
                    open={open}
                    handleClose={() => setOpen(false)}
                    {...dialogConfig}
                />
            )}
            {children}
        </CreateChannelDialogContext.Provider>
    );
};
