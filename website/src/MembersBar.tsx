import { List } from "@mui/material";

export const MembersBar: React.FC = ({ children }) => {
    return (
        <List
            style={{
                minWidth: "max-content",
                borderLeft: "1px solid #ccc",
                height: "100vh",
                padding: "1rem",
                paddingTop: "3rem",
            }}
        >
            {children}
        </List>
    );
};
