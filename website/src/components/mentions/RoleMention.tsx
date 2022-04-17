import { Typography } from "@mui/material";
import { useRolesStore } from "../../../stores/useRolesStore";

export const RoleMention: React.FC<{
    id: string;
    guild: string;
}> = ({ id, guild }) => {
    const role = useRolesStore(state => state[guild].find(r => r.id === id));

    return (
        <Typography
            sx={{
                bgcolor: role
                    ? role?.color
                        ? `#${role.color.toString(16)}`
                        : "primary.dark"
                    : undefined,
                p: 0.3,
                borderRadius: "4px",
            }}
            component="span"
        >
            @{role ? role.name : "deleted role"}
        </Typography>
    );
};
