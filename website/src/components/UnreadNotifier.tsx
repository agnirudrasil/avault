import { Box } from "@mui/material";
import { NewIcon } from "./NewIcon";

export const UnreadNotifier: React.FC = () => {
    return (
        <Box
            style={{
                height: "2px",
                width: "100%",
                background: "red",
                zIndex: -1,
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "0",
                    right: "-1px",
                    transform: "translateY(-30%)",
                }}
            >
                <NewIcon />
            </div>
        </Box>
    );
};
