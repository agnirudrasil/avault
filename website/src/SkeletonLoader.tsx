import { CardHeader, Skeleton } from "@mui/material";

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
                <Skeleton
                    animation="wave"
                    height={10}
                    width="80%"
                    style={{ marginBottom: 6 }}
                />
            }
            subheader={<Skeleton animation="wave" height={10} width="40%" />}
        />
    );
};
