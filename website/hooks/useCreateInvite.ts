import { useContext } from "react";
import {
    CreateInviteDialogContext,
    CreateInviteConfig,
} from "../contexts/CreateInviteContext";

export const useCreateInvite = () => {
    const { openDialog } = useContext(CreateInviteDialogContext);

    const createInvite = (config?: CreateInviteConfig) => openDialog(config);

    return { createInvite };
};
