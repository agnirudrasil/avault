const CUSTOM_EMOJI_CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL + "emojis";

//@ts-ignore
export const getCustomEmojiUrl = (id: string, animated?: boolean) => {
    return `${CUSTOM_EMOJI_CDN_BASE_URL}/${id}`;
};
