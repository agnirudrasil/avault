CREATE OR REPLACE FUNCTION process_mention(
    user_id bigint,
    channel_id bigint,
    guild_id bigint,
    user_mentions bigint[],
    role_mentions bigint[],
    mentions_everyone boolean
) RETURNS void AS
$$
DECLARE
    guild_member guild_members;
BEGIN
    SELECT *
    into guild_member
    FROM guild_members gm
    WHERE gm.user_id = $1
      AND gm.guild_id = $3;
    IF mentions_everyone = true AND
       (guild_member.is_owner OR guild_member.permissions & 8 = 8 OR guild_member.permissions & 131072 = 131072) THEN
        UPDATE unread
        SET mentions_count = mentions_count + 1
        WHERE unread.channel_id = $2
          AND unread.user_id IN (SELECT gm.user_id
                                 FROM guild_members gm
                                 WHERE gm.guild_id = $3
                                   AND (permissions & 8 = 8
                                     OR is_owner
                                     OR compute_channel_overwrites(gm.permissions,
                                                                   gm.guild_id,
                                                                   gm.user_id,
                                                                   6861355209106463459) & 1024 = 1024));
    ELSE
        UPDATE unread
        SET mentions_count = mentions_count + 1
        WHERE unread.channel_id = $2
          AND unread.user_id IN (SELECT gm.user_id
                                 FROM guild_members gm
                                          left join role_members rm on gm.user_id = rm.user_id and gm.guild_id = rm.guild_id
                                 WHERE gm.guild_id = $3
                                   AND (gm.user_id = ANY ($4)
                                     OR rm.role_id = ANY ($5)));
    END IF;
END;
$$ LANGUAGE plpgsql;
