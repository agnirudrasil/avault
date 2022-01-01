import { AddPhotoAlternate } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Alert,
    Avatar,
    Badge,
    Button,
    FormControl,
    FormLabel,
    Slide,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import produce from "immer";
import { useRouter } from "next/router";
import { useEditGuild } from "../../hooks/requests/useEditGuild";
import { useUnsaved } from "../../hooks/useUnsaved";
import { Guild, useGuildsStore } from "../../stores/useGuildsStore";
import { SettingsLayout } from "../components/layouts/SettingsLayout";
import { getGuildInitials } from "../get-guild-intials";

const TransitionComponent = (props: any) => {
    return <Slide {...props} direction="up" unmountOnExit />;
};

const SettingIndexPage = () => {
    const router = useRouter();
    const guild = useGuildsStore(
        state => state[router.query.server_id as string]
    );

    const { handleReset, ogData, setOgdata, unsaved } = useUnsaved(guild);
    const { isLoading, mutateAsync } = useEditGuild();

    const saveFn = async (d: Guild) => {
        await mutateAsync({
            guildId: d.id,
            name: d.name,
        });
    };

    return (
        <SettingsLayout>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={unsaved}
                TransitionComponent={TransitionComponent}
            >
                <Alert
                    severity="warning"
                    action={
                        <div>
                            <Button
                                size="small"
                                variant="text"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <LoadingButton
                                loading={isLoading}
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    saveFn(ogData);
                                }}
                            >
                                Save
                            </LoadingButton>
                        </div>
                    }
                >
                    You have unsaved changes!
                </Alert>
            </Snackbar>
            <div
                style={{
                    minWidth: "740px",
                    width: "100%",
                    padding: "60px 10px 0 20px",
                    height: "100%",
                    maxHeight: "100vh",
                }}
            >
                <Typography variant="h6" style={{ userSelect: "none" }}>
                    Server Overview
                </Typography>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        marginTop: "10px",
                        gap: "2rem",
                        width: "100%",
                    }}
                >
                    <Badge
                        overlap="circular"
                        badgeContent={<AddPhotoAlternate fontSize="small" />}
                    >
                        <Avatar
                            sx={{
                                width: 128,
                                height: 128,
                                background: "#5865f2",
                                cursor: "pointer",
                            }}
                        >
                            <Typography variant="h3">
                                {getGuildInitials(ogData?.name || "")}
                            </Typography>
                        </Avatar>
                    </Badge>
                    <Box>
                        <Typography maxWidth={400}>
                            We recommend a image of atleast 512x512px for this
                            server
                        </Typography>
                        <Button disabled variant="outlined" color="inherit">
                            Upload Image
                        </Button>
                    </Box>
                    <FormControl sx={{ width: "100%" }}>
                        <FormLabel>Server Name</FormLabel>
                        <TextField
                            value={ogData?.name}
                            onChange={e => {
                                setOgdata(d =>
                                    produce(d, draft => {
                                        draft.name = e.target.value;
                                    })
                                );
                            }}
                            fullWidth
                        />
                    </FormControl>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default SettingIndexPage;
