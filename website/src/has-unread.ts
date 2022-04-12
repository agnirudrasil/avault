export const hasUnread = (last_read?: string, last_message_id?: string) =>
    BigInt(last_read ?? 1) < BigInt(last_message_id ?? 2);
