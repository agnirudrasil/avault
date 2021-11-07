import {
    TextFieldProps,
    fieldToTextField,
    fieldToInputBase,
    InputBaseProps,
} from "formik-mui";
import { TextField, InputBase } from "@mui/material";

export const CustomTextField = (props: TextFieldProps) => {
    return <TextField fullWidth {...fieldToTextField(props)} />;
};

export const MessageField = (props: InputBaseProps) => (
    <InputBase
        sx={{ ml: 1, flex: 1 }}
        autoComplete="off"
        inputProps={{
            "aria-label": "send message",
        }}
        multiline
        {...fieldToInputBase(props)}
    />
);
