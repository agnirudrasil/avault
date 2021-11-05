import { useContext } from "react";
import {
    CreateChannelConfig,
    CreateChannelDialogContext,
} from "../contexts/CreateChannelContext";

export const useCreateChannel = () => {
    const { openDialog } = useContext(CreateChannelDialogContext);

    const createChannel = (config: CreateChannelConfig) => openDialog(config);

    return { createChannel };
};
