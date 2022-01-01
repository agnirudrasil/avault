import styled from "@emotion/styled";
import { Add } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import Router, { useRouter } from "next/router";
import { useState } from "react";
import { useGuildsStore } from "../../stores/useGuildsStore";
import { getGuildInitials } from "../get-guild-intials";
import { CreateServerDialog } from "./dialogs/CreateServerDialog";
import { ServerItems } from "./ServerItems";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    height: 100vh;
    width: max-content;
    padding: 0.5rem;
    border-right: 1px solid #ccc;
`;

const Separator = styled.div`
    height: 2px;
    width: 32px;
    border-radius: 1px;
    background-color: #ccc;
`;

export const ServersBar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const guilds = useGuildsStore();
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Container>
            <ServerItems
                id=""
                selected={router.asPath === "/channels/@me"}
                onClick={() => Router.replace("/channels/@me")}
            >
                <img style={{ width: "90%" }} src="/logo-black.png" />
            </ServerItems>
            <Separator />
            {Object.keys(guilds).map(key => {
                const guild = guilds[key];
                return (
                    typeof guild !== "function" && (
                        <ServerItems
                            title={guild.name ?? ""}
                            key={guild.id}
                            id={guild.id + "/"}
                            selected={guild.id === router.query.server_id}
                        >
                            {getGuildInitials(guild.name ?? "")}
                        </ServerItems>
                    )
                );
            })}
            <Separator />
            <Tooltip title="Add a server">
                <IconButton onClick={handleClickOpen}>
                    <Add />
                </IconButton>
            </Tooltip>
            <CreateServerDialog open={open} onClose={handleClose} />
        </Container>
    );
};
