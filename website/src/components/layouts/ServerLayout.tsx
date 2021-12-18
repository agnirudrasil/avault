import styled from "@emotion/styled";
import {
    Avatar,
    CircularProgress,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMessages } from "../../../hooks/requests/useMessages";
import { ChannelBar } from "../ChannelBar";
import { ChannelLayout } from "../ChannelLayout";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { MembersBar } from "../MembersBar";
import { Message } from "../Message";
import { MessageBox } from "../MessageBox";
import { ServersBar } from "../ServerBar";

const Container = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100vh;
    width: 100%;
`;

export const organizeMessages = (messages: any[]): React.ReactNode => {
    return !messages
        ? null
        : messages.map((m, index, array) => {
              const timestamp = new Date(m.timestamp);
              return (
                  <Message
                      key={m.id}
                      type={
                          m.author.id === array[index + 1]?.author.id &&
                          timestamp.getTime() -
                              new Date(array[index + 1]?.timestamp).getTime() <=
                              5 * 60 * 1000
                              ? "full"
                              : "half"
                      }
                      message={{ ...m, timestamp }}
                  />
              );
          });
};

export const ServerLayout: React.FC<{
    name: string;
    members: any[];
    channels: any[];
}> = ({ name, members, channels }) => {
    const router = useRouter();
    const { status, data } = useMessages(router.query.channel as string);
    return (
        <Container>
            <ServersBar />
            <ChannelBar name={name}>
                <ChannelLayout channels={channels} />
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
                        height: "100%",
                        display: "flex",
                        flexDirection: "column-reverse",
                        width: "100%",
                    }}
                >
                    {status === "loading" ? (
                        <CircularProgress />
                    ) : (
                        organizeMessages(data && (data.messages as any[]))
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
                        <ListItemText
                            primary={member.nickname || member.user.username}
                        />
                    </ListItemButton>
                ))}
            </MembersBar>
        </Container>
    );
};
