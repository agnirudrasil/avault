import { LibraryAddCheck } from "@mui/icons-material";
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import { useGetOAuth2Tokens } from "../../../../hooks/requests/useGetOAuth2Tokens";
import { SCOPES } from "../../../scopes";
import { DefaultProfilePic } from "../../DefaultProfilePic";
import { ConfirmDeauthorize } from "../../dialogs/ConfirmDeauthorize";
import { UserSettings } from "../../layouts/routes/UserSettings";

export const UserSettingsAuthorizedApps = () => {
    const { data, isLoading } = useGetOAuth2Tokens();
    return (
        <UserSettings>
            <Stack sx={{ width: "100%", height: "max-content" }} spacing={3}>
                <Typography variant="h5" fontWeight="bold">
                    Authorized Apps
                </Typography>
                {isLoading && (
                    <div>
                        <LinearProgress />
                    </div>
                )}
                {data?.map(app => (
                    <Card variant="outlined">
                        <CardHeader
                            avatar={
                                <Avatar
                                    src={
                                        app.application.icon
                                            ? `${process.env.NEXT_PUBLIC_CDN_URL}app-icons/${app.application.id}/${app.application.icon}`
                                            : undefined
                                    }
                                >
                                    <DefaultProfilePic tag={"#0000"} />
                                </Avatar>
                            }
                            title={app.application.name}
                            subitile=""
                            action={
                                <ConfirmDeauthorize id={app.application.id} />
                            }
                        />
                        <CardContent>
                            <Stack spacing={1}>
                                {app.application.description && (
                                    <>
                                        <Typography
                                            fontWeight="bold"
                                            color="GrayText"
                                            variant="button"
                                        >
                                            about this app
                                        </Typography>
                                        <Typography variant="body2">
                                            {app.application.description}
                                        </Typography>
                                    </>
                                )}
                                <Typography
                                    fontWeight="bold"
                                    color="GrayText"
                                    variant="button"
                                >
                                    permissions
                                </Typography>
                                <List dense disablePadding>
                                    {app.scopes.map(permission => (
                                        <ListItem disableGutters>
                                            <ListItemIcon
                                                sx={{ minWidth: 0, mr: 1 }}
                                            >
                                                <LibraryAddCheck color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={SCOPES[permission]}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </UserSettings>
    );
};
