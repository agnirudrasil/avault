import styled from "@emotion/styled";
import {
    Avatar,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMessages } from "../../hooks/requests/useMessages";
import { useMessagesStore } from "../../stores/useMessagesStore";
import { ChannelBar } from "../ChannelBar";
import { ChannelLayout } from "../ChannelLayout";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { MembersBar } from "../MembersBar";
import { MessageBox } from "../MessageBox";
import { ServersBar } from "../ServerBar";

const Container = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100vh;
    width: 100%;
`;

export const organizeMessages = (message: any[]): React.ReactNode => {
    return message.map((m, index, array) => {
        const timestamp = new Date(m.timestamp);
        return m.author.id === array[index + 1]?.author.id &&
            timestamp.getTime() -
                new Date(array[index + 1]?.timestamp).getTime() <=
                5 * 60 * 1000 ? (
            <ListItem
                sx={{
                    "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                    },
                    "&:hover .time": {
                        visibility: "visible",
                    },
                    paddingTop: "0",
                    paddingBottom: "0",
                }}
            >
                <ListItemAvatar sx={{ visibility: "hidden" }} className="time">
                    <Typography
                        variant="overline"
                        color="textSecondary"
                        sx={{ marginLeft: "-0.25rem" }}
                    >
                        {new Intl.DateTimeFormat("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                        })
                            .format(timestamp)
                            .replaceAll(" ", "")}
                    </Typography>
                </ListItemAvatar>
                <ListItemText primary={<Typography>{m.content}</Typography>} />
            </ListItem>
        ) : (
            <ListItem
                sx={{
                    "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                    },
                }}
                key={m.id}
                dense
            >
                <ListItemAvatar>
                    <Avatar>
                        <DefaultProfilePic tag={m.author.tag} />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={m.author.username}
                    secondary={<Typography>{m.content}</Typography>}
                />
            </ListItem>
        );
    });
};

export const ServerLayout: React.FC<{
    name: string;
    members: any[];
    channels: any[];
}> = ({ name, members }) => {
    const router = useRouter();
    const { status } = useMessages(router.query.channel as string);
    const messages = useMessagesStore(state => state.messages);
    console.log(messages);
    return (
        <Container>
            <ServersBar />
            <ChannelBar name={name}>
                <ChannelLayout />
            </ChannelBar>
            <div
                style={{
                    width: "100%",
                    padding: "1rem",
                    paddingTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    height: "100vh",
                }}
            >
                <List
                    style={{
                        overflowY: "auto",
                        maxHeight: "100%",
                        display: "flex",
                        flexDirection: "column-reverse",
                        width: "100%",
                    }}
                >
                    {status === "loading" ? (
                        <CircularProgress />
                    ) : (
                        organizeMessages(messages as any[])
                    )}
                </List>
                <MessageBox />
            </div>
            <MembersBar>
                {members.map(member => (
                    <ListItemButton key={member.id}>
                        <ListItemAvatar>
                            <Avatar>
                                <DefaultProfilePic tag={member.user.tag} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={member.user.username} />
                    </ListItemButton>
                ))}
            </MembersBar>
        </Container>
    );
};
