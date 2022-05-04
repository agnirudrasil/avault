export const removeEmpty = (obj: any) => {
    Object.keys(obj).forEach((key: any) =>
        obj[key] === undefined ? delete obj[key] : {}
    );

    return obj;
};
