import {
    Avatar,
    Fade,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Zoom,
} from "@material-ui/core";
import React from "react";

export const Message: React.FC<{ date: string }> = ({ date }) => {
    return (
        <Fade in={true} timeout={500}>
            <ListItem alignItems="flex-start">
                <ListItemAvatar>
                    <Avatar alt="Agnirudra Sil" src="/profile.jpg" />
                </ListItemAvatar>
                <ListItemText
                    primary={`Agnirudra Sil • ${new Date().toLocaleString(
                        "en-IN"
                    )}`}
                    secondary={
                        <React.Fragment>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Sit debitis veritatis in saepe voluptatum,
                            beatae, fuga exercitationem tenetur repellendus
                            veniam dolorem aut, sapiente sint hic deserunt
                            laudantium libero voluptatem. Distinctio sequi
                            provident esse magni quisquam possimus aliquid error
                            libero impedit.
                        </React.Fragment>
                    }
                />
            </ListItem>
        </Fade>
    );
};
