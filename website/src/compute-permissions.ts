import { Roles } from "../stores/useRolesStore";
import { GuildMembers } from "../stores/useUserStore";
import { Channel } from "../types/channels";

export const computeBasePermissions = (
    roles: Roles[],
    guild: any,
    guildMember: GuildMembers
): "ALL" | bigint => {
    if (guild?.owner_id === guildMember?.user?.id) {
        return "ALL";
    }

    const role_everyone = roles?.find(r => r.id === guild.id);
    let permissions = BigInt(role_everyone?.permissions || 0);

    guildMember.roles?.forEach(role_id => {
        const role = roles?.find(r => r.id === role_id);
        if (role) {
            permissions |= BigInt(role.permissions);
        }
    });

    if ((permissions & BigInt(8)) === BigInt(8)) {
        return "ALL";
    }

    return permissions;
};

export const computeOverwrites = (
    basePermissions: "ALL" | bigint,
    member: GuildMembers,
    channel: Channel
): "ALL" | bigint => {
    if (basePermissions === "ALL") {
        return basePermissions;
    }

    let permissions = basePermissions;
    const overwriteEveryone = channel.overwrites?.find(
        o => o.id === member.guild_id
    );

    if (overwriteEveryone) {
        permissions &= ~BigInt(overwriteEveryone.deny);
        permissions |= BigInt(overwriteEveryone.allow);
    }

    let allow: null | bigint = null;
    let deny: null | bigint = null;

    member.roles?.forEach(role_id => {
        const overwrite = channel.overwrites?.find(o => o.id === role_id);
        if (overwrite) {
            if (allow === null) {
                allow = BigInt(overwrite.allow);
            } else {
                allow |= BigInt(overwrite.allow);
            }
            if (deny === null) {
                deny = ~BigInt(overwrite.deny);
            } else {
                deny &= ~BigInt(overwrite.deny);
            }
        }
    });

    if (deny !== null) {
        permissions &= ~BigInt(deny);
    }

    if (allow !== null) {
        permissions |= allow;
    }

    const overwriteMember = channel.overwrites?.find(
        o => o.id === member.user.id
    );

    if (overwriteMember) {
        permissions &= ~BigInt(overwriteMember.deny);
        permissions |= BigInt(overwriteMember.allow);
    }

    return permissions;
};

export const computePermissions = (
    roles: Roles[],
    guild: any,
    guildMember: GuildMembers,
    channel: Channel
) => {
    return computeOverwrites(
        computeBasePermissions(roles, guild, guildMember),
        guildMember,
        channel
    );
};

export const checkPermissions = (base: bigint | "ALL", perm: string) =>
    base === "ALL" ? true : (base & BigInt(perm)) === BigInt(perm);
