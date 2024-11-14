import { Card, CardHeader, Link } from "@mui/material";

export const EmbedMessage: React.FC<{
    embed: any;
}> = ({ embed }) => {
    return (
        <Card
            sx={{
                maxWidth: 345,
            }}
        >
            <CardHeader
                title={
                    embed.url ? (
                        <Link
                            sx={{
                                fontWeight: "bold",
                            }}
                            target="_blank"
                            href={embed!.url}
                        >
                            {embed.title}
                        </Link>
                    ) : (
                        embed.title
                    )
                }
                subheader={embed.description}
            />
            {embed.image && (
                <img
                    alt={embed.title}
                    width="100%"
                    height="auto"
                    src={embed.image?.url}
                />
            )}
        </Card>
    );
};
