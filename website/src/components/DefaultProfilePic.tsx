export const DefaultProfilePic: React.FC<{
    tag: string;
    width?: number;
    height?: number;
}> = ({ tag, width = 40, height = 40 }) => {
    return (
        <img
            alt="Profile Picture"
            src={`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=
${tag.substring(1)}&width=${width}&height=${height}`}
        />
    );
};
