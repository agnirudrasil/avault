export const getGuildInitials = (name: string) =>
    name
        .split(" ")
        .slice(0, 3)
        .map(n => n[0]?.toUpperCase())
        .join("");
