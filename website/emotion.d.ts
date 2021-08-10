import "@emotion/react";
import type { Palette } from "@material-ui/core";

declare module "@emotion/react" {
    export interface Theme extends Palette {}
}
