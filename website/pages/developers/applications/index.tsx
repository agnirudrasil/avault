import MenuIcon from "@mui/icons-material/Menu";
import {
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    Divider,
    List,
    ListItemText,
    IconButton,
    Avatar,
    Stack,
    ListItemButton,
    Button,
    CircularProgress,
    Menu,
    MenuItem,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { useGetApplications } from "../../../hooks/requests/useGetApplications";
import { useLogout } from "../../../hooks/requests/useLogout";
import { useMeQuery } from "../../../hooks/requests/useMeQuery";
import { DefaultProfilePic } from "../../../src/components/DefaultProfilePic";
import { CreateApplicationDialog } from "../../../src/components/dialogs/CreateApplication";

const drawerWidth = 240;

export const ApplicationsIndexPage: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const onClose = () => {
        setOpen(false);
    };

    const { data, isLoading, isError } = useMeQuery();

    const { data: applications } = useGetApplications({
        enabled: !!data,
    });

    const { mutateAsync } = useLogout();

    if (isError) {
        return <></>;
    }

    const drawer = (
        <div>
            <CreateApplicationDialog open={open} onClose={onClose} />
            <Toolbar>
                <Stack
                    component={Typography}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ userSelect: "none" }}
                    variant="button"
                >
                    <Avatar
                        sx={{
                            display: "inline-block",
                            width: "30px",
                            height: "30px",
                            verticalAlign: "middle",
                        }}
                        src="/logo-black.png"
                        alt="Logo"
                    />{" "}
                    <span>DEVELOPER PORTAL</span>
                </Stack>
            </Toolbar>
            <Divider />
            <List>
                {["Applications", "Documentation"].map(text => (
                    <ListItemButton
                        selected={text === "Applications"}
                        color="primary"
                        key={text}
                    >
                        <ListItemText primary={text} />
                    </ListItemButton>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar component={Stack} direction="row" spacing={4}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Applications
                    </Typography>
                    <Box sx={{ flex: "1" }} />
                    <Button
                        onClick={() => {
                            setOpen(true);
                        }}
                        disableElevation
                        variant="contained"
                    >
                        New Application
                    </Button>
                    {!isLoading ? (
                        <IconButton
                            disableRipple
                            onClick={e => {
                                setAnchorEl(e.currentTarget);
                            }}
                        >
                            <Avatar
                                src={
                                    data?.avatar
                                        ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${data.id}/${data.avatar}`
                                        : undefined
                                }
                            >
                                <DefaultProfilePic tag={data?.tag || ""} />
                            </Avatar>
                        </IconButton>
                    ) : (
                        <CircularProgress size="small" />
                    )}
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                <Stack spacing={6}>
                    <Typography variant="h6">My Applications</Typography>
                    <Stack direction="row" spacing={2}>
                        {applications?.map(app => (
                            <Link
                                href={`/developers/applications/${app.id}/`}
                                passHref
                            >
                                <Box
                                    sx={{
                                        p: 1.5,
                                        width: "max-content",
                                        maxWidth: "154px",
                                        bgcolor: "grey.800",
                                        borderRadius: 1,
                                        pb: 1,
                                        cursor: "pointer",
                                        transition: "all 200ms ease",
                                        ":hover": {
                                            transform: "translateY(-15px)",
                                        },
                                    }}
                                >
                                    <Avatar
                                        src={
                                            app.icon
                                                ? `${process.env.NEXT_PUBLIC_CDN_URL}app-icons/${app.id}/${app.icon}`
                                                : undefined
                                        }
                                        sx={{
                                            width: "130px",
                                            height: "130px",
                                            bgcolor: "background.paper",
                                            borderRadius: 1,
                                            mb: 1,
                                            color: "white",
                                        }}
                                    >
                                        {app.name
                                            .split(" ")
                                            .map(s => s[0].toUpperCase())
                                            .join("")}
                                    </Avatar>
                                    <Typography
                                        sx={{
                                            maxWidth: "100%",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {app.name}
                                    </Typography>
                                </Box>
                            </Link>
                        ))}
                    </Stack>
                </Stack>
            </Box>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                PaperProps={{
                    variant: "outlined",
                }}
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                }}
            >
                <MenuItem>
                    <ListItemText
                        primary={
                            <Typography color="GrayText" variant="caption">
                                Logged in as
                            </Typography>
                        }
                        secondary={
                            <Typography variant="body2">
                                {data?.username}{" "}
                                <Typography
                                    variant="body2"
                                    component="span"
                                    color="GrayText"
                                >
                                    {data?.tag}
                                </Typography>
                            </Typography>
                        }
                    />
                    <Button
                        onClick={async () => {
                            await mutateAsync();
                        }}
                        sx={{ ml: 2 }}
                        size="small"
                        color="error"
                    >
                        <Typography>Log Out</Typography>
                    </Button>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ApplicationsIndexPage;
