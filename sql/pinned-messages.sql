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

ALTER TABLE messages ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT FALSE;
