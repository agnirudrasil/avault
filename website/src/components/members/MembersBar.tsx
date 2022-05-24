import { GitHub, Api } from "@mui/icons-material";
import { IconButton, List, ListSubheader } from "@mui/material";
import { useRouter } from "next/router";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { LightTooltip } from "../LightTooltip";
import { Member } from "./Member";

export const MembarsBar: React.FC = () => {
    const router = useRouter();
    const members = useGuildsStore(
        state => state.guilds[router.query.guild as string]?.members
    );

    return (
        <List
            subheader={
                <ListSubheader sx={{ m: -1, mb: 1, p: 0, bgcolor: "grey.800" }}>
                    <LightTooltip title="Source Code">
                        <IconButton
                            sx={{ ml: "63%" }}
                            href="https://github.com/agnirudrasil/avault"
                            target="_blank"
                        >
                            <GitHub />
                        </IconButton>
                    </LightTooltip>
                    <LightTooltip title="Developer Portal">
                        <IconButton
                            href="/developers/applications"
                            target="_blank"
                        >
                            <Api />
                        </IconButton>
                    </LightTooltip>
                </ListSubheader>
            }
            dense
            sx={{ minWidth: "240px", bgcolor: "grey.900", p: 1 }}
        >
            {Object.keys(members ?? {}).map(user_id => {
                const member = members[user_id];
                return <Member key={user_id} member={member} />;
            })}
        </List>
    );
};
