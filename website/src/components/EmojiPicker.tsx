import { CustomEmoji, Picker, PickerProps } from "emoji-mart";
import { useGuildsStore } from "../../stores/useGuildsStore";

export const EmojiPicker: React.FC<PickerProps> = props => {
    const guilds = useGuildsStore(state => state.guilds);
    const emojis: CustomEmoji[] = Object.keys(guilds)
        .map(guildId =>
            guilds[guildId].emojis.map(
                e =>
                    ({
                        name: e.name,
                        short_names: [e.name],
                        imageUrl: `${process.env.NEXT_PUBLIC_CDN_URL}emojis/${e.id}`,
                        customCategory: guilds[guildId].name,
                        colons: `:${e.name}:`,
                        id: e.id,
                        keywords: [e.name],
                    } as CustomEmoji)
            )
        )
        .flat();

    const icons = {
        categories: {
            custom: () => <img alt="logo" src="/logo-black.png" />,
        },
    };

    return (
        <Picker
            title="AVAULT"
            emoji=":speech_balloon:"
            emojiTooltip
            custom={emojis}
            icons={icons as any}
            {...props}
        />
    );
};
