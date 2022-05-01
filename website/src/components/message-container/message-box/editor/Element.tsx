import { Typography, useTheme } from "@mui/material";

export const Element = ({ attributes, children, element }: any) => {
    const theme = useTheme();
    switch ((element as any).type) {
        case "bulleted-list":
            return <blockquote {...attributes}>{children}</blockquote>;
        case "emoji":
            return (
                <span contentEditable={false} {...attributes}>
                    <img
                        style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                        }}
                        alt="emoji"
                        width="22px"
                        height="22px"
                        src={(element as any).src}
                    />
                    {children}
                </span>
            );
        case "mention":
            return (
                <span
                    {...attributes}
                    contentEditable={false}
                    style={{
                        padding: "3px 3px 2px",
                        margin: "0 1px",
                        verticalAlign: "baseline",
                        borderRadius: "4px",
                        backgroundColor:
                            element.character.type === "role"
                                ? element.character.color
                                    ? `#${element.character.color.toString(16)}`
                                    : theme.palette.primary.dark
                                : theme.palette.primary.dark,
                        fontSize: "0.9em",
                    }}
                >
                    {element.character.type === "channel" ? "#" : "@"}
                    {element.character.name}
                    {children}
                </span>
            );
        case "list-item":
        default:
            return (
                <Typography component="p" {...attributes}>
                    {children}
                </Typography>
            );
    }
};
