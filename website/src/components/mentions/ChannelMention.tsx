import { Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";
import { usePermssions } from "../../../hooks/usePermissions";
import { useChannelsStore } from "../../../stores/useChannelsStore";

export const ChannelMention: React.FC<{
    id: string;
    guild: string;
}> = ({ id, guild }) => {
    const channel = useChannelsStore(state => state.channels[guild][id]);
    const {} = usePermssions(guild, channel.id);

    return (
        <Link href={`/channels/${guild}/${channel.id}`} passHref>
            <MuiLink underline="hover" sx={{ color: "white" }}>
                <Typography
                    sx={{
                        bgcolor: "primary.main",
                        p: 0.3,
                        borderRadius: "4px",
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                            bgcolor: "primary.dark",
                        },
                    }}
                    component="span"
                >
                    #{channel ? channel.name : "deleted channel"}
                </Typography>
            </MuiLink>
        </Link>
    );
};
