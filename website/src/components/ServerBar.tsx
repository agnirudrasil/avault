import { Add } from "@mui/icons-material";
import { Divider, IconButton, Stack } from "@mui/material";
import { Fragment, useCallback, useState } from "react";
import { useGuildsStore } from "../../stores/useGuildsStore";
import { CreateServerDialog } from "./dialogs/CreateServerDialog";
import { GuildItem } from "./GuildItem";

export const ServerBar: React.FC = () => {
    const guildPreview = useGuildsStore(state => state.guildPreview);
    const [open, setOpen] = useState<boolean>(false);
    const onClose = useCallback(() => setOpen(false), [open]);
    const onOpen = useCallback(() => setOpen(true), [open]);
    return (
        <Stack
            alignItems="center"
            sx={{
                height: "100%",
                borderRight: "1px solid",
                borderColor: "grey.900",
            }}
        >
            <GuildItem />
            <Divider flexItem />
            {Object.keys(guildPreview).map((guild, index, array) => (
                <Fragment key={guild}>
                    <GuildItem guild={guildPreview[guild]} key={guild} />
                    {index === array.length - 1 && (
                        <Divider key={`divider-${guild}`} flexItem />
                    )}
                </Fragment>
            ))}
            <IconButton onClick={onOpen} sx={{ m: 2 }}>
                <Add />
            </IconButton>
            <CreateServerDialog open={open} onClose={onClose} />
        </Stack>
    );
};
