import { Clear } from "@mui/icons-material";
import { Stack, Box, IconButton } from "@mui/material";
import React, { forwardRef } from "react";
import { useRoutesStore } from "../../../stores/useRoutesStore";

export const SettingsLayout: React.FC<{ nav: React.ReactNode }> = forwardRef(
    ({ children, nav, ...props }, ref) => {
        const setRoute = useRoutesStore(state => state.setRoute);
        return (
            <Stack
                {...props}
                ref={ref}
                sx={{
                    height: "100vh",
                    maxHeight: "100vh",
                    overflow: "hidden",
                    width: "100%",
                }}
                direction="row"
            >
                <Stack
                    sx={{
                        flex: "1 0 218px",
                        bgcolor: "grey.900",
                        pt: "60px",
                        alignItems: "flex-end",
                    }}
                >
                    {nav}
                </Stack>
                <Stack
                    direction="row"
                    sx={{ flex: "1 1 800px", pt: "60px", pl: "10px" }}
                >
                    <Box
                        sx={{
                            minWidth: "460px",
                            maxWidth: "740px",
                            flex: "1 1 auto",
                        }}
                    >
                        {children}
                    </Box>
                    <Box>
                        <IconButton
                            onClick={() => {
                                setRoute("/");
                            }}
                            sx={{ border: "2px solid grey" }}
                        >
                            <Clear />
                        </IconButton>
                    </Box>
                </Stack>
            </Stack>
        );
    }
);
