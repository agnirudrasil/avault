import { CheckCircle, Link, LocalPolice, MoreHoriz } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Container,
    DialogActions,
    Divider,
    FormControl,
    FormHelperText,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useState } from "react";
import { useAuthorizeMutation } from "../../hooks/requests/useAuthorize";
import { useGetAuthorize } from "../../hooks/requests/useGetAuthorize";
import { DefaultProfilePic } from "../../src/components/DefaultProfilePic";
import {
    checkPermissions,
    checkPermissionsRaw,
} from "../../src/compute-permissions";
import { Permissions } from "../../src/permissions";
import { SCOPES } from "../../src/scopes";

interface Props {
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
    permissions?: string;
    response_type?: string;
}

const OAuth2AuthorizePage: NextPage<Props> = props => {
    const { data, isFetching, isError } = useGetAuthorize(props);
    const scopes = props.scope?.split(" ") || [];
    const scopeArray = scopes
        .map(scope => SCOPES[scope])
        .filter(scope => !!scope);

    const [guild, setGuild] = useState<string | null>(null);
    const [view, setView] = useState<"main" | "confirm">("main");
    const [permissions, setPermissions] = useState(props.permissions);
    const { mutateAsync, isLoading } = useAuthorizeMutation();

    return (
        <Container
            sx={{
                display: "grid",
                placeItems: "center",
                position: "relative",
                width: "100%",
                height: "100vh",
                maxHeight: "100vh",
                overflow: "hidden",
                m: 0,
            }}
        >
            <img
                src="/logo.png"
                alt="logo"
                style={{
                    position: "absolute",
                    width: "100px",
                    height: "auto",
                    top: "32px",
                    left: "32px",
                }}
            />
            <Paper
                sx={{
                    minWidth: "360px",
                    maxWidth: "360px",
                    maxHeight: "90%",
                    overflowY: "auto",
                }}
            >
                {isFetching && <LinearProgress />}
                {isError && (
                    <Typography color="error" variant="h6">
                        An unexpected error has occurred
                    </Typography>
                )}
                {data && (
                    <>
                        <Stack
                            divider={<Divider flexItem />}
                            sx={{ m: 2 }}
                            spacing={2}
                        >
                            <Box>
                                <Stack
                                    alignItems="center"
                                    justifyContent="space-evenly"
                                    direction="row"
                                    sx={{ mb: 2 }}
                                >
                                    <Avatar
                                        sx={{ width: "64px", height: "64px" }}
                                    >
                                        {data.application.name
                                            .split(" ")
                                            .map(s => s[0].toUpperCase())
                                            .join("")}
                                    </Avatar>
                                    <MoreHoriz
                                        fontSize="large"
                                        color="disabled"
                                    />
                                    <Avatar
                                        sx={{ width: "64px", height: "64px" }}
                                    >
                                        <DefaultProfilePic
                                            width={64}
                                            height={64}
                                            tag={data.user.tag}
                                        />
                                    </Avatar>
                                </Stack>
                                <Stack
                                    spacing={0.5}
                                    sx={{ textAlign: "center" }}
                                >
                                    <Typography color="GrayText">
                                        An external Application
                                    </Typography>
                                    <Typography variant="h6">
                                        {data.application.name}{" "}
                                        <Typography
                                            variant="caption"
                                            component="span"
                                            sx={{
                                                verticalAlign: "middle",
                                                color: "white",
                                                bgcolor: "primary.dark",
                                                p: 0.5,
                                                borderRadius: "4px",
                                            }}
                                        >
                                            BOT
                                        </Typography>
                                    </Typography>
                                    <Typography color="GrayText">
                                        wants to access your AVAULT account
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="GrayText"
                                    >
                                        Signed in as{" "}
                                        <span style={{ color: "white" }}>
                                            {data.user.username}
                                            {data.user.tag}
                                        </span>
                                    </Typography>
                                </Stack>
                            </Box>
                            {view === "confirm" ? (
                                <Stack spacing={2} sx={{ width: "100%" }}>
                                    <Typography variant="caption">
                                        Confirm that you want to grant{" "}
                                        <strong>{data.application.name}</strong>{" "}
                                        the following permissions on{" "}
                                        <strong>
                                            {data.guilds?.find(
                                                ({ id }) => id === guild
                                            )?.name || ""}{" "}
                                            server
                                        </strong>
                                    </Typography>
                                    <List dense sx={{ width: "100%" }}>
                                        {Object.keys(Permissions)
                                            .filter(
                                                k =>
                                                    (BigInt(Permissions[k]) &
                                                        BigInt(
                                                            props.permissions ||
                                                                0
                                                        )) ===
                                                    BigInt(Permissions[k])
                                            )
                                            .map(k => (
                                                <ListItem key={k}>
                                                    <ListItemIcon>
                                                        <Checkbox
                                                            onChange={e => {
                                                                if (
                                                                    !e.target
                                                                        .checked
                                                                ) {
                                                                    setPermissions(
                                                                        p =>
                                                                            (
                                                                                BigInt(
                                                                                    p ||
                                                                                        "0"
                                                                                ) &
                                                                                ~BigInt(
                                                                                    Permissions[
                                                                                        k
                                                                                    ]
                                                                                )
                                                                            ).toString()
                                                                    );
                                                                } else {
                                                                    setPermissions(
                                                                        p =>
                                                                            (
                                                                                BigInt(
                                                                                    p ||
                                                                                        "0"
                                                                                ) |
                                                                                BigInt(
                                                                                    Permissions[
                                                                                        k
                                                                                    ]
                                                                                )
                                                                            ).toString()
                                                                    );
                                                                }
                                                            }}
                                                            checked={checkPermissionsRaw(
                                                                permissions ||
                                                                    "0",
                                                                Permissions[k]
                                                            )}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText primary={k} />
                                                </ListItem>
                                            ))}
                                    </List>
                                </Stack>
                            ) : (
                                <>
                                    {scopeArray && scopeArray.length > 0 && (
                                        <Stack
                                            spacing={2}
                                            sx={{ width: "100%" }}
                                        >
                                            <Typography variant="button">
                                                this will allow the developer of{" "}
                                                {data.application.name} to:
                                            </Typography>
                                            <List dense sx={{ width: "100%" }}>
                                                {scopeArray.map(scope => (
                                                    <ListItem key="scope">
                                                        <ListItemIcon
                                                            sx={{
                                                                minWidth: 0,
                                                                mr: 1,
                                                            }}
                                                        >
                                                            <CheckCircle color="success" />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={scope}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Stack>
                                    )}
                                    {data.guilds && data.guilds.length > 0 && (
                                        <FormControl fullWidth>
                                            <InputLabel id="server-select-label">
                                                Select a server
                                            </InputLabel>
                                            <Select
                                                label="Select a server"
                                                id="server-select"
                                                labelId="server-select-label"
                                                value={guild}
                                                onChange={e => {
                                                    setGuild(e.target.value);
                                                }}
                                            >
                                                {data.guilds
                                                    .filter(g =>
                                                        checkPermissions(
                                                            BigInt(
                                                                g.permissions
                                                            ),
                                                            Permissions.MANAGE_GUILD
                                                        )
                                                    )
                                                    .map(guild => (
                                                        <MenuItem
                                                            value={guild.id}
                                                            key={guild.id}
                                                        >
                                                            {guild.name}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            <FormHelperText>
                                                This requires you to have{" "}
                                                <strong>Manage Server</strong>{" "}
                                                permission in this server
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                </>
                            )}
                            <List dense sx={{ width: "100%" }}>
                                {data.redirect_uri && (
                                    <ListItem>
                                        <ListItemIcon
                                            sx={{ minWidth: 0, mr: 1 }}
                                        >
                                            <Link
                                                color="warning"
                                                fontSize="small"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "warning.dark",
                                                    }}
                                                >
                                                    Once your authorize, you
                                                    will be redirected outside
                                                    of AVAULT to:{" "}
                                                    {data.redirect_uri}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                )}
                                <ListItem>
                                    <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                                        <LocalPolice fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="caption">
                                                This application{" "}
                                                <strong>cannot</strong> read
                                                your messages or send messages
                                                as you.
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </List>
                        </Stack>
                        <DialogActions
                            sx={{
                                bgcolor: "background.paper",
                                borderTop: "1px solid",
                                borderTopColor: "grey.800",
                                justifyContent: "space-between",
                                p: 3,
                            }}
                        >
                            <Button
                                onClick={async () => {
                                    if (view === "confirm" && data.guilds) {
                                        setView("main");
                                    } else {
                                        await mutateAsync({
                                            data: props,
                                            authorized: false,
                                            guild,
                                            permissions,
                                        });
                                    }
                                }}
                                color="inherit"
                            >
                                {view === "confirm" && data.guilds
                                    ? "Back"
                                    : "Cancel"}
                            </Button>
                            <LoadingButton
                                loading={isLoading}
                                onClick={async () => {
                                    if (
                                        props.permissions &&
                                        data.guilds &&
                                        view === "main"
                                    ) {
                                        setView("confirm");
                                    } else {
                                        await mutateAsync({
                                            data: props,
                                            authorized: true,
                                            guild,
                                            permissions,
                                        });
                                    }
                                }}
                                disabled={data.guilds && !guild}
                                variant="contained"
                                disableElevation
                            >
                                {props.permissions &&
                                view !== "confirm" &&
                                data.guilds
                                    ? "Continue"
                                    : "Authorize"}
                            </LoadingButton>
                        </DialogActions>
                    </>
                )}
            </Paper>
        </Container>
    );
};

OAuth2AuthorizePage.getInitialProps = async ({ query }) => ({
    client_id: query.client_id as string | undefined,
    redirect_uri: query.redirect_uri as string | undefined,
    scope: query.scope as string,
    state: query.state as string | undefined,
    permissions: query.permissions as string | undefined,
    response_type: query.response_type as string | undefined,
});

export default OAuth2AuthorizePage;
