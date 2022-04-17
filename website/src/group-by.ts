import { format } from "date-fns";
import { Messages } from "../stores/useMessagesStore";

export const groupBy = (xs: Messages[]) => {
    return xs.reduce((rv: Record<string, Messages[]>, x) => {
        (rv[format(new Date(x.timestamp), "MMM d, yyyy")] =
            rv[format(new Date(x.timestamp), "MMM d, yyyy")] || []).push(x);
        return rv;
    }, {});
};
