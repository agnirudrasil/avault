import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    SvgIcon,
} from "@mui/material";
import { useRouter } from "next/router";
import { Draggable } from "react-beautiful-dnd";
import { ChannelIcon } from "../ChannelIcon";

export const TextChannel: React.FC<{
    name: string;
    id: string;
    index: number;
}> = ({ name, id, index }) => {
    const router = useRouter();
    return (
        <Draggable draggableId={id} index={index}>
            {provided => (
                <ListItemButton
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() =>
                        router.replace(
                            `/channels/${router.query.server_id}/${id}`
                        )
                    }
                    sx={{
                        borderRadius: "7px",
                        maxWidth: "100%",
                        textOverflow: "ellipsis",
                    }}
                    selected={router.query.channel === id}
                >
                    <ListItemIcon sx={{ minWidth: "30px" }}>
                        <SvgIcon>
                            <ChannelIcon />
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary={name} />
                </ListItemButton>
            )}
        </Draggable>
    );
};
