import { Roles } from "../stores/useRolesStore";

export const rolesSort = (a: Roles, b: Roles) => {
    if (a.position < b.position) return 1;
    if (a.position > b.position) return -1;
    if (a?.position === b?.position && a.id > b.id) return 1;
    if (a?.position === b?.position && a.id < b.id) return -1;
    return 0;
};
