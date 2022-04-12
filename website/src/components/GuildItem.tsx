import { Home } from "@mui/icons-material";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { GuildPreview } from "../../stores/useGuildsStore";
import { getGuildInitials } from "../get-guild-intials";
import { LightTooltip } from "./LightTooltip";

interface Props {
    guild?: GuildPreview;
}
export const GuildItem: React.FC<Props> = ({ guild }) => {
    const router = useRouter();
    return (
        <Link href={`/channels/${guild ? guild.id : "@me"}`} passHref>
            <MuiLink underline="none" sx={{ color: "common.white" }}>
                <LightTooltip
                    placement="right"
                    title={guild?.name || "Home"}
                    disableInteractive
                >
                    <Box
                        sx={{
                            bgcolor:
                                router.query.guild === guild?.id
                                    ? "primary.dark"
                                    : "grey.900",
                            m: 1,
                            borderRadius:
                                router.query.guild === guild?.id ? 3 : 10,
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                            width: 48,
                            height: 48,
                            transition: "all 300ms ease",
                            "&:hover": {
                                borderRadius: 3,
                                bgcolor: "primary.dark",
                            },
                            position: "relative",
                            ":before": {
                                content: "''",
                                position: "absolute",
                                width: "5px",
                                height:
                                    router.query.guild === guild?.id
                                        ? "70%"
                                        : false
                                        ? "20%"
                                        : 0,
                                top: "50%",
                                left: "-8px",
                                bgcolor: "common.white",
                                borderRadius: "0 20px 20px 0",
                                transform: "translateY(-50%)",
                                transition: "height 300ms",
                            },
                            ":hover::before": {
                                height:
                                    router.query.guild === guild?.id
                                        ? "70%"
                                        : "50%",
                            },
                        }}
                    >
                        {guild ? (
                            <Typography fontWeight="bold">
                                {getGuildInitials(guild?.name)}
                            </Typography>
                        ) : (
                            <Home />
                        )}
                    </Box>
                </LightTooltip>
            </MuiLink>
        </Link>
    );
};
