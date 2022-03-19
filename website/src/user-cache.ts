let user = "";

export const getUser = () => user;
export const setUserId = (v: string) => {
    user = v;
    return user;
};
