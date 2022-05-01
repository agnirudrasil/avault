import { endOfDay } from "date-fns";
import { Messages } from "../stores/useMessagesStore";

export const groupBy = (xs: Messages[]) => {
    return xs.reduce((rv: Record<string, Messages[]>, x) => {
        (rv[endOfDay(new Date(x.timestamp)).toISOString()] =
            rv[endOfDay(new Date(x.timestamp)).toISOString()] || []).push(x);
        return rv;
    }, {});
};
