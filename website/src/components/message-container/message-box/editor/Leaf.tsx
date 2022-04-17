import { Typography } from "@mui/material";
import { RenderLeafProps } from "slate-react";

export const Leaf = ({ children, attributes, leaf }: RenderLeafProps) => {
    if (leaf.punctuation) {
        return (
            <Typography component="span" color="GrayText" {...attributes}>
                {children}
            </Typography>
        );
    }
    if (leaf.inlineCode) {
        return (
            <Typography component="code" {...attributes}>
                {children}
            </Typography>
        );
    } else {
        return (
            <Typography
                component="span"
                sx={{
                    fontWeight: leaf.strong ? "bold" : "normal",
                    textDecoration: `${leaf.underline ? "underline" : ""} ${
                        leaf.strikethrough ? "line-through" : ""
                    }`,
                    fontStyle: leaf.emphasis ? "italic" : "normal",
                    color: leaf.url ? "primary.dark" : "inherit",
                }}
                {...attributes}
            >
                {children}
            </Typography>
        );
    }
};
