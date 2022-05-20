import { List } from "@mui/material";
import { useRouter } from "next/router";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { Member } from "./Member";

export const MembarsBar: React.FC = () => {
    const router = useRouter();
    const members = useGuildsStore(
        state => state.guilds[router.query.guild as string]?.members
    );

    return (
        <List dense sx={{ minWidth: "240px", bgcolor: "grey.900", p: 1 }}>
            {Object.keys(members ?? {}).map(user_id => {
                const member = members[user_id];
                return <Member key={user_id} member={member} />;
            })}
        </List>
    );
};
