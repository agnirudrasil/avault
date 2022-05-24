import { BrokenImage, Group } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Card,
    CardHeader,
    Skeleton,
    Typography,
    Link as MuiLink,
} from "@mui/material";
import { useRouter } from "next/router";
import {
    Invite as InviteType,
    useGetInvite,
} from "../../hooks/requests/useGetInvite";
import { useJoinInvite } from "../../hooks/requests/useJoinInvite";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { useGuildsStore } from "../../stores/useGuildsStore";
import { User } from "../../stores/useUserStore";
import { getGuildInitials } from "../get-guild-intials";
import { getGroupDMName } from "../getGroupDmName";
import { getUser } from "../user-cache";

export const Invite: React.FC<{ code: string; author: User }> = ({
    code,
    author,
}) => {
    const { data, isLoading, isError } = useGetInvite(code);

    return isError ? (
        <ErrorInvite author={author} data={data} />
    ) : isLoading ? (
        <LoadingInvite />
    ) : data?.guild ? (
        <GuildInvite data={data} author={author} code={code} />
    ) : (
        <ChannelInvite data={data!} author={author} code={code} />
    );
};

export const ChannelInvite: React.FC<{
    author: User;
    data: InviteType;
    code: string;
}> = ({ data, author, code }) => {
    const router = useRouter();
    const channel = useChannelsStore(
        state => state.privateChannels[data?.channel?.id || ""]
    );

    const { mutateAsync, isLoading: isJoining } = useJoinInvite();

    return (
        <Card sx={{ maxWidth: "500px", width: "500px" }} variant="outlined">
            <CardHeader
                sx={{ pb: 0 }}
                title={
                    <Typography
                        color="GrayText"
                        fontWeight="bold"
                        variant="button"
                    >
                        {author.id === getUser()
                            ? "you sent an invite to join a group dm"
                            : "you have been invited to join a group dm"}
                    </Typography>
                }
            />
            <CardHeader
                avatar={
                    <Avatar
                        src={
                            data.channel.icon
                                ? `${process.env.NEXT_PUBLIC_CDN_URL}channel-icons/${data.channel.id}/${data.channel.icon}`
                                : undefined
                        }
                        alt="icon"
                        sx={{ bgcolor: "sucess.dark" }}
                    >
                        <Group />
                    </Avatar>
                }
                title={
                    <Typography variant="h6">
                        {getGroupDMName(data.channel)}
                    </Typography>
                }
                subheader={`${data.channel.recipients.length} Members`}
                action={
                    <LoadingButton
                        loading={isJoining}
                        onClick={async () => {
                            await mutateAsync({
                                code,
                                onError: () => ({}),
                            });
                            router.replace(
                                `/channels/@me/${data?.channel?.id ?? ""}`
                            );
                        }}
                        disabled={Boolean(channel)}
                        color="success"
                        variant="contained"
                        disableElevation
                        href={
                            channel
                                ? `/channels/@me/${channel?.id ?? ""}`
                                : undefined
                        }
                    >
                        {channel ? "Joined" : "Join"}
                    </LoadingButton>
                }
            />
        </Card>
    );
};

export const GuildInvite: React.FC<{
    author: User;
    data?: InviteType;
    code: string;
}> = ({ data, author, code }) => {
    const router = useRouter();
    const guild = useGuildsStore(
        state => state.guildPreview[data?.guild?.id || ""]
    );
    const channel = useChannelsStore(state =>
        data?.guild
            ? state.channels[data.guild.id]?.[data.channel.id]
            : state.privateChannels[data?.channel?.id || ""]
    );

    const { mutateAsync, isLoading: isJoining } = useJoinInvite();

    return (
        <Card sx={{ maxWidth: "500px", width: "500px" }} variant="outlined">
            <CardHeader
                sx={{ pb: 0 }}
                title={
                    <Typography
                        color="GrayText"
                        fontWeight="bold"
                        variant="button"
                    >
                        {author.id === getUser()
                            ? "you sent an invite to join a server"
                            : "you have been invited to join a server"}
                    </Typography>
                }
            />
            <CardHeader
                avatar={
                    <Avatar
                        src={
                            data?.guild?.icon
                                ? `${process.env.NEXT_PUBLIC_CDN_URL}icons/${data.guild.id}/${data?.guild.icon}`
                                : undefined
                        }
                        alt="icon"
                    >
                        {getGuildInitials(data?.guild?.name ?? "")}
                    </Avatar>
                }
                title={
                    <Typography variant="h6">{data?.guild?.name}</Typography>
                }
                subheader={
                    <MuiLink
                        href={
                            guild
                                ? `/channels/${guild?.id}/${channel?.id ?? ""}`
                                : undefined
                        }
                        underline={guild ? "hover" : "none"}
                        sx={{ color: "white" }}
                    >
                        #{data?.channel?.name}
                    </MuiLink>
                }
                action={
                    <LoadingButton
                        loading={isJoining}
                        onClick={async () => {
                            if (!guild) {
                                await mutateAsync({
                                    code,
                                    onError: () => ({}),
                                });
                                router.replace(
                                    `/channels/${data?.guild?.id ?? ""}/${
                                        data?.channel?.id ?? ""
                                    }`
                                );
                            }
                        }}
                        color="success"
                        variant="contained"
                        disableElevation
                        href={
                            guild
                                ? `/channels/${guild?.id}/${channel?.id ?? ""}`
                                : undefined
                        }
                    >
                        {guild ? "Joined" : "Join"}
                    </LoadingButton>
                }
            />
        </Card>
    );
};

export const LoadingInvite: React.FC = () => {
    return (
        <Card sx={{ maxWidth: "500px", width: "500px" }} variant="outlined">
            <CardHeader
                sx={{ pb: 0 }}
                title={
                    <Typography
                        color="GrayText"
                        fontWeight="bold"
                        variant="button"
                    >
                        resolving invite
                    </Typography>
                }
            />
            <CardHeader
                avatar={<Skeleton width={40} height={40} variant="circular" />}
                title={<Skeleton width="80%" />}
                subheader={<Skeleton width="40%" />}
                action={<Skeleton width={56} height={36} />}
            />
        </Card>
    );
};

const ErrorInvite: React.FC<{ author: User; data?: InviteType }> = ({
    author,
    data,
}) => {
    return (
        <Card sx={{ maxWidth: "500px", width: "500px" }} variant="outlined">
            <CardHeader
                sx={{ pb: 0 }}
                title={
                    <Typography
                        color="GrayText"
                        fontWeight="bold"
                        variant="button"
                    >
                        {author.id === getUser()
                            ? "You sent an invite but..."
                            : " You recieved an invite but..."}
                    </Typography>
                }
            />
            <CardHeader
                avatar={
                    <Avatar
                        src={
                            data?.guild?.icon
                                ? `${process.env.NEXT_PUBLIC_CDN_URL}icons/${data.guild.id}/${data?.guild.icon}`
                                : undefined
                        }
                        alt="icon"
                    >
                        <BrokenImage />
                    </Avatar>
                }
                title={
                    <Typography color="error" variant="h6">
                        Invalid Invite
                    </Typography>
                }
                subheader={
                    author.id === getUser()
                        ? "Try sending a new invite!"
                        : `Ask ${author.username} to send a new invite!`
                }
            />
        </Card>
    );
};
