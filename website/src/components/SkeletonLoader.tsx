import { CardHeader, Skeleton, Typography } from "@mui/material";

export const SkeletonLoader: React.FC = () => {
    return (
        <CardHeader
            avatar={
                <Skeleton
                    animation="wave"
                    variant="circular"
                    width={40}
                    height={40}
                />
            }
            title={
                <Typography variant="h5">
                    <Skeleton
                        animation="wave"
                        width="80%"
                        style={{ marginBottom: 6 }}
                    />
                </Typography>
            }
            subheader={
                <Typography variant="h1">
                    <Skeleton animation="wave" width="40%" />
                </Typography>
            }
        />
    );
};
