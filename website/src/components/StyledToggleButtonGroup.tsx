import { styled, ToggleButtonGroup } from "@mui/material";

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(
    ({ theme }) => ({
        "& .MuiToggleButtonGroup-grouped": {
            border: 0,
            margin: theme.spacing(0.3),
            "&.Mui-disabled": {
                border: 0,
            },
            "&:not(:first-of-type)": {
                borderRadius: theme.shape.borderRadius,
            },
            "&:first-of-type": {
                borderRadius: theme.shape.borderRadius,
            },
        },
    })
);
