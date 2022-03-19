import { Logout } from "@mui/icons-material";
import { List, Avatar, CardHeader, Card, IconButton } from "@mui/material";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { CreateChannelDialogProvider } from "../../contexts/CreateChannelContext";
import { CreateInviteDialogProvider } from "../../contexts/CreateInviteContext";
import { useLogout } from "../../hooks/requests/useLogout";
import { useUserStore } from "../../stores/useUserStore";
import { DefaultProfilePic } from "./DefaultProfilePic";
import { ServerNavbar } from "./ServerNavbar";

export const ChannelBar: React.FC<{ name?: string }> = ({ children, name }) => {
    const { mutateAsync } = useLogout();
    const user = useUserStore(state => state.user);
    return (
        <CreateChannelDialogProvider>
            <CreateInviteDialogProvider>
                <List
                    sx={{
                        borderRight: "1px solid #ccc",
                        height: "100vh",
                        maxHeight: "100vh",
                        overflowY: "hidden",
                        minWidth: "250px",
                        textOverflow: "ellipsis",
                        display: "flex",
                        flexDirection: "column",
                        paddingBottom: "0",
                    }}
                    dense
                >
                    {name ? <ServerNavbar name={name} /> : "Channels"}
                    <DragDropContext onDragEnd={() => {}}>
                        <Droppable droppableId="droppable">
                            {provided => (
                                <List
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    sx={{
                                        maxHeight: "100%",
                                        overflowY: "auto",
                                        gap: "0.5rem",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    dense
                                >
                                    {children}
                                    {provided.placeholder}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <Card
                        variant="outlined"
                        sx={{
                            width: "100%",
                            borderRadius: "0",
                            borderLeft: "none",
                            borderRight: "none",
                            marginTop: "auto",
                        }}
                    >
                        <CardHeader
                            avatar={
                                <Avatar>
                                    <DefaultProfilePic tag={user.tag} />
                                </Avatar>
                            }
                            title={user.username}
                            subheader={user.tag}
                            action={
                                <IconButton
                                    onClick={async () => {
                                        await mutateAsync();
                                    }}
                                    color="error"
                                >
                                    <Logout />
                                </IconButton>
                            }
                        />
                    </Card>
                </List>
            </CreateInviteDialogProvider>
        </CreateChannelDialogProvider>
    );
};
