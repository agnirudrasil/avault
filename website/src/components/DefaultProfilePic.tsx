export const DefaultProfilePic: React.FC<{ tag: string }> = ({ tag }) => {
    return (
        <img
            src={`https://avatars.dicebear.com/api/identicon/${tag.substring(
                1
            )}.svg?r=50&backgroundColor=white&width=40&height=40`}
        />
    );
};
