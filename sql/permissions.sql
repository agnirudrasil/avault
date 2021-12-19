CREATE OR REPLACE FUNCTION permissions() returns trigger as
$$
DECLARE
    member_id bigint := 0;
    server_id bigint := 0;
BEGIN
    IF TG_OP = 'INSERT' THEN
        member_id := NEW.user_id;
        server_id := NEW.guild_id;
    ELSE
        member_id := OLD.user_id;
        server_id := OLD.guild_id;
    END IF;

    UPDATE guild_members
    SET permissions = (SELECT coalesce(bit_or(roles.permissions), 0)
                       FROM roles
                                LEFT JOIN role_members ON roles.id = role_members.role_id
                       WHERE (role_members.user_id = member_id AND role_members.guild_id = server_id)
                          OR (roles.id = roles.guild_id AND roles.guild_id = server_id))
    WHERE user_id = member_id
      AND guild_id = server_id;

    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END
$$ LANGUAGE plpgsql;


CREATE TRIGGER permissions_update
    AFTER INSERT OR DELETE
    ON role_members
    FOR EACH ROW
EXECUTE PROCEDURE permissions();

CREATE OR REPLACE FUNCTION compute_channel_overwrites(
    base bigint,
    guild bigint,
    member bigint,
    channel bigint) RETURNS bigint AS
$$
DECLARE
    permission bigint := base;
    ov         RECORD;
BEGIN
    FOR ov IN (SELECT bit_and(~deny) as deny, bit_or(allow) as allow
               FROM overwrites
               WHERE channel_id = channel
                 AND (overwrites.id = guild
                   OR overwrites.id = member
                   OR overwrites.id IN
                      (SELECT role_id FROM role_members WHERE user_id = member AND guild_id = guild)))
        LOOP
            IF ov.deny THEN
                permission := permission & ~ov.deny;
            END IF;
            IF ov.allow THEN
                permission := permission | ov.allow;
            END IF;
            RETURN permission;
        END LOOP;
    RETURN permission;
END;
$$ LANGUAGE plpgsql;

SELECT user_id
FROM guild_members
WHERE permissions & 8 = 8
   OR is_owner
   OR compute_channel_overwrites(guild_members.permissions,
                                 guild_id,
                                 guild_members.user_id,
                                 6861355209106463459) & 1024 = 1024;
SELECT *
FROM overwrites
WHERE channel_id = 6861355209106463459
  AND (overwrites.id = 6861355209106463456
    OR overwrites.id = 6861345527209751200
    OR overwrites.id IN
       (SELECT role_id FROM role_members WHERE user_id = 6861345527209751200 AND guild_id = 6861355209106463456));

select *
from guilds;