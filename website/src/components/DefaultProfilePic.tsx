export const DefaultProfilePic: React.FC<{
    tag: string;
    width?: number;
    height?: number;
}> = ({ tag, width = 40, height = 40 }) => {
    return (
        <img
            alt="Profile Picture"
            src={`https://avatars.dicebear.com/api/identicon/${tag.substring(
                1
            )}.svg?r=50&backgroundColor=white&width=${width}&height=${height}`}
        />
    );
};
