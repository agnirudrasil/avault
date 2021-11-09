import { Button, ButtonProps } from "@mui/material";
import { useCopy } from "../../hooks/useCopy";

export const CopyButton: React.FC<ButtonProps & { text: string }> = ({
    text,
    ...props
}) => {
    const { copied, copyToClipboard } = useCopy();
    return (
        <Button
            color={copied ? "success" : "primary"}
            disableElevation
            variant="contained"
            onClick={() => copyToClipboard(text)}
            {...props}
        >
            {copied ? "Copied!" : "Copy"}
        </Button>
    );
};
