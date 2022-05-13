import { ArrowBack, Build, Extension, Home } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
    Toolbar,
    Stack,
    Typography,
    Avatar,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Box,
    CssBaseline,
    AppBar,
    IconButton,
    Button,
    CircularProgress,
    Drawer,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItem,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useLogout } from "../../../hooks/requests/useLogout";
import { useMeQuery } from "../../../hooks/requests/useMeQuery";
import { DefaultProfilePic } from "../DefaultProfilePic";

const drawerWidth = 360;

export const ApplicationLayout: React.FC<{ id: string }> = ({
    children,
    id,
}) => {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const { data, isLoading, isError } = useMeQuery();

    const { mutateAsync } = useLogout();

    if (isError) {
        return <></>;
    }

    const drawer = (
        <div>
            <Toolbar>
                <Link href="/developers/applications">
                    <Stack
                        component={Typography}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            userSelect: "none",
                            cursor: "pointer",
                            color: "GrayText",
                            ":hover": {
                                color: "white",
                            },
                        }}
                        variant="body2"
                    >
                        <ArrowBack fontSize="small" />
                        Back To Applications
                    </Stack>
                </Link>
            </Toolbar>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <Link href={`/developers/applications/${id}/`}>
                        <ListItemButton
                            selected={router.asPath.endsWith(id)}
                            color="primary"
                        >
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary="General Information" />
                        </ListItemButton>
                    </Link>
                </ListItem>
                <ListItem disablePadding>
                    <Link href={`/developers/applications/${id}/oauth2`}>
                        <ListItemButton
                            selected={router.asPath.endsWith("oauth2")}
                            color="primary"
                        >
                            <ListItemIcon>
                                <Build />
                            </ListItemIcon>
                            <ListItemText primary="OAuth2" />
                        </ListItemButton>
                    </Link>
                </ListItem>
                <ListItem disablePadding>
                    <Link href={`/developers/applications/${id}/bot`}>
                        <ListItemButton
                            selected={router.asPath.endsWith("bot")}
                            color="primary"
                        >
                            <ListItemIcon>
                                <Extension />
                            </ListItemIcon>
                            <ListItemText primary="Bot" />
                        </ListItemButton>
                    </Link>
                </ListItem>
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
                <Toolbar
                    component={Stack}
                    direction="row"
                    spacing={4}
                    justifyContent="flex-end"
                    sx={{
                        width: "100%",
                    }}
                >
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
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
                {children}
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
