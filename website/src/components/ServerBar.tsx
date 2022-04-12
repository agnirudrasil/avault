import styled from "@emotion/styled";
import { Add } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import Router, { useRouter } from "next/router";
import { useState } from "react";
import { Guild, useGuildsStore } from "../../stores/useGuildsStore";
import { getGuildInitials } from "../get-guild-intials";
import { CreateServerDialog } from "./dialogs/CreateServerDialog";
import { ServerItems } from "./ServerItems";
import { hasUnread } from "../has-unread";
import { useChannelsStore } from "../../stores/useChannelsStore";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    height: 100vh;
    width: max-content;
    border-right: 1px solid #ccc;
`;

const Separator = styled.div`
    height: 2px;
    width: 32px;
    border-radius: 1px;
    background-color: #ccc;
`;

export const ServerItemWithUnread: React.FC<{ guild: Guild }> = ({ guild }) => {
    const router = useRouter();
    const channels = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const serverHasUnread = channels.some(channel =>
        hasUnread(channel.last_read, channel.last_message_id)
    );
    return (
        <Box
            key={guild.id}
            sx={{
                margin: "0 0.5rem",
                position: "relative",
                ":hover::before": {
                    height: router.query.server_id === guild.id ? "70%" : "55%",
                },
                "::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: -8,
                    width: 5,
                    height:
                        router.query.server_id === guild.id
                            ? "70%"
                            : serverHasUnread
                            ? "10px"
                            : 0,
                    zIndex: 10,
                    background: "black",
                    transform: "translateY(-50%)",
                    borderRadius: "0 100px 100px 0",
                    transition: "height 200ms ease",
                },
            }}
        >
            <ServerItems
                title={guild.name ?? ""}
                id={guild.id + "/"}
                selected={guild.id === router.query.server_id}
            >
                {getGuildInitials(guild.name ?? "")}
            </ServerItems>
        </Box>
    );
};

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
            <Box sx={{ margin: "0.5rem" }}>
                <ServerItems
                    id=""
                    selected={router.asPath === "/channels/@me"}
                    onClick={() => Router.replace("/channels/@me")}
                >
                    <img
                        alt="logo"
                        style={{ width: "48px", height: "48px" }}
                        src="/logo-black.png"
                    />
                </ServerItems>
            </Box>
            <Separator />
            {Object.keys(guilds).map(key => {
                const guild = guilds[key];
                return (
                    typeof guild !== "function" && (
                        <ServerItemWithUnread guild={guild} />
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
