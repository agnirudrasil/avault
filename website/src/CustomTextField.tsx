import { TextFieldProps, fieldToTextField } from "formik-mui";
import { TextField } from "@mui/material";

export const CustomTextField = (props: TextFieldProps) => {
    return <TextField fullWidth {...fieldToTextField(props)} />;
};
