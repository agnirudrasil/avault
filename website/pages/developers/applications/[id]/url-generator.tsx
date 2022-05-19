import {
    Box,
    Checkbox,
    FormControl,
    FormLabel,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { isNil, omitBy } from "lodash";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useGetApplication } from "../../../../hooks/requests/useGetApplication";
import { CopyButton } from "../../../../src/components/Form/CopyButton";
import { ApplicationLayout } from "../../../../src/components/layouts/ApplicationLayout";
import { Permissions } from "../../../../src/permissions";
import { SCOPES } from "../../../../src/scopes";

export const URLGeneratorPage: NextPage<{ id: string }> = ({ id }) => {
    const { data } = useGetApplication(id);

    const [scopes, setScopes] = useState<(keyof typeof SCOPES)[]>([]);
    const [redirect, setRedirect] = useState<string>("");
    const [perms, setPermissions] = useState<bigint | null>(null);

    const requireCode =
        scopes.length > 0 &&
        !scopes.every(scope =>
            ["bot", "applications.commands", ""].includes(scope)
        );

    const value =
        scopes.length > 0
            ? `${window.location.origin}/oauth2/authorize?` +
              new URLSearchParams(
                  omitBy(
                      {
                          client_id: id,
                          scope: scopes.join(" "),
                          response_type: requireCode ? "code" : undefined,
                          redirect_uri: redirect || undefined,
                          permissions: perms?.toString() || undefined,
                      },
                      isNil
                  ) as any
              )
            : "";

    useEffect(() => {
        if (scopes.includes("bot") && isNil(perms)) {
            setPermissions(BigInt(0));
        }
        if (!scopes.includes("bot") && !isNil(perms)) {
            setPermissions(null);
        }
    }, [scopes]);

    useEffect(() => {
        if (!requireCode) {
            setRedirect("");
        }
    }, [requireCode]);

    return (
        <ApplicationLayout id={id}>
            <Stack
                spacing={3}
                sx={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                }}
            >
                <Box sx={{ width: "100%" }}>
                    <Typography variant="h6">OAuth2 URL Generator</Typography>
                    <Typography variant="subtitle1">
                        Generate an invite link for your application by picking
                        the scopes and permissions it needs to function. Then,
                        share the URL to others!
                    </Typography>
                </Box>
                <List
                    component="pre"
                    dense
                    subheader={<ListSubheader>SCOPES</ListSubheader>}
                >
                    {Object.keys(SCOPES).map(scope => (
                        <ListItem>
                            <ListItemIcon>
                                <Checkbox
                                    checked={scopes.includes(scope)}
                                    onChange={e => {
                                        if (!e.target.checked) {
                                            setScopes(scopes =>
                                                scopes.filter(s => s !== scope)
                                            );
                                        } else {
                                            setScopes(scopes => [
                                                ...scopes,
                                                scope,
                                            ]);
                                        }
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText primary={scope} />
                        </ListItem>
                    ))}
                </List>
                {requireCode && (
                    <FormControl>
                        <FormLabel>SELECT REDIRECT URI</FormLabel>
                        <Select
                            value={redirect}
                            onChange={e => setRedirect(e.target.value)}
                        >
                            {data?.redirect_uris.map(uri => (
                                <MenuItem value={uri}>{uri}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}{" "}
                {scopes.includes("bot") && (
                    <List
                        component="pre"
                        dense
                        subheader={
                            <ListSubheader>BOT PERMISSIONS</ListSubheader>
                        }
                    >
                        {Object.keys(Permissions).map(permission => (
                            <ListItem>
                                <ListItemIcon>
                                    <Checkbox
                                        disabled={
                                            ((perms ?? BigInt(0)) &
                                                BigInt(8)) ===
                                                BigInt(8) &&
                                            !(Permissions[permission] === "8")
                                        }
                                        checked={
                                            ((perms ?? BigInt(0)) &
                                                BigInt(
                                                    Permissions[permission]
                                                )) ===
                                            BigInt(Permissions[permission])
                                        }
                                        onChange={e => {
                                            if (!e.target.checked) {
                                                setPermissions(
                                                    p =>
                                                        (p ?? BigInt(0)) &
                                                        ~BigInt(
                                                            Permissions[
                                                                permission
                                                            ]
                                                        )
                                                );
                                            } else {
                                                setPermissions(
                                                    p =>
                                                        (p ?? BigInt(0)) |
                                                        BigInt(
                                                            Permissions[
                                                                permission
                                                            ]
                                                        )
                                                );
                                            }
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={permission} />
                            </ListItem>
                        ))}
                    </List>
                )}
                <FormControl
                    sx={{
                        position: "sticky",
                        left: 0,
                        bottom: 0,
                        bgcolor: "background.paper",
                        p: 1,
                        boxShadow: "shadows.4",
                    }}
                >
                    <FormLabel>GENERATED URL</FormLabel>
                    <TextField
                        value={
                            requireCode
                                ? !redirect
                                    ? "Please select a redirect uri."
                                    : value ||
                                      "Please select at least one OAuth2 scope."
                                : value
                        }
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CopyButton
                                        disabled={
                                            requireCode
                                                ? !redirect || !value
                                                : !value
                                        }
                                        text={value}
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />
                </FormControl>
            </Stack>
        </ApplicationLayout>
    );
};

URLGeneratorPage.getInitialProps = async ({ query }) => {
    return {
        id: query.id as string,
    };
};
export default URLGeneratorPage;
