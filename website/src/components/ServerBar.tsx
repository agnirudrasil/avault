import styled from "@emotion/styled";
import { Add } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import Router from "next/router";
import { useState } from "react";
import { useGuildsStore } from "../../stores/useGuildsStore";
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

const getGuildInitials = (name: string) =>
    name
        .split(" ")
        .slice(0, 3)
        .map(n => n[0]?.toUpperCase())
        .join("");

export const ServersBar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const guilds = useGuildsStore();
    const handleClickOpen = () => {
        setOpen(true);
    };
    console.log(guilds);
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Container>
            <ServerItems id="" onClick={() => Router.replace("/channels/@me")}>
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
                            id={guild.id}
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
