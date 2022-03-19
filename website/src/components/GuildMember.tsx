import { useRouter } from "next/router";
import { useMemo } from "react";
import { useGuildsStore } from "../../stores/useGuildsStore";
import { Roles, useRolesStore } from "../../stores/useRolesStore";
import { rolesSort } from "../sort-roles";

export const GuildMember: React.FC<{ id: string }> = ({ id, children }) => {
    const router = useRouter();
    const { member } = useGuildsStore(state => ({
        member: state[router.query.server_id as string].members[id],
    }));

    const roles = useRolesStore(
        state => state[router.query.server_id as string]
    );

    const memberRoles = useMemo(() => {
        if (member) {
            const myRoles = member.roles.map(r =>
                roles.find(role => role.id === r)
            ) as Roles[];

            myRoles.sort(rolesSort);

            return myRoles;
        }
        return [];
    }, [roles, member]);

    return (
        <span
            style={{
                color: `#${
                    memberRoles.find(a => a.color !== 0)?.color.toString(16) ||
                    "000"
                }`,
            }}
        >
            {children}
        </span>
    );
};
