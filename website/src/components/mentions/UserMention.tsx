import { Typography, Link } from "@mui/material";
import { useGuildsStore } from "../../../stores/useGuildsStore";

export const UserMention: React.FC<{ id: string; guild: string }> = ({
    id,
    guild,
}) => {
    const member = useGuildsStore(state => state.guilds[guild].members[id]);

    return (
        <Typography
            id={id}
            sx={{
                bgcolor: "primary.dark",
                p: 0.3,
                borderRadius: "4px",
                transition: "background-color 0.3s ease",
                cursor: "pointer",
            }}
            component="span"
        >
            <Link underline="hover" color="white">
                @{member ? member.nick || member.user.username : "Unknown user"}
            </Link>
        </Typography>
    );
};
