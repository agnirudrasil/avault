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

CREATE OR REPLACE FUNCTION roles_update() RETURNS TRIGGER AS
$$
DECLARE
    roles_id  bigint;
    guilds_id bigint;
BEGIN

    IF TG_OP = 'UPDATE' THEN
        IF new.permissions = old.permissions THEN
            RETURN NEW;
        END IF;
        roles_id := NEW.id;
        guilds_id := NEW.guild_id;
    ELSE
        roles_id := OLD.id;
        guilds_id := OLD.guild_id;
    END IF;

    IF roles_id = guilds_id THEN
        UPDATE guild_members
        SET permissions = (SELECT bit_or(permissions)
                           FROM roles
                           WHERE roles.id = guilds_id
                              OR roles.id IN (SELECT role_id
                                              FROM role_members
                                              WHERE (guild_id = guild_members.guild_id
                                                  AND user_id = guild_members.user_id)))
        WHERE guild_id = guilds_id;
    ELSE
        UPDATE guild_members
        SET permissions = (SELECT bit_or(permissions)
                           FROM roles
                           WHERE roles.id = guilds_id
                              OR roles.id IN (SELECT role_members.role_id
                                              FROM role_members
                                              WHERE (role_members.guild_id = guild_members.guild_id
                                                  AND role_members.user_id = guild_members.user_id)))
        WHERE user_id IN (SELECT role_members.user_id
                          FROM role_members
                          WHERE role_members.guild_id = guilds_id
                            AND role_members.role_id = roles_id)
          AND guild_id = guilds_id;
    END IF;

    IF TG_OP = 'UPDATE' THEN
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

CREATE TRIGGER roles_permissions_update
    AFTER UPDATE OR DELETE
    ON roles
    FOR EACH ROW
EXECUTE PROCEDURE roles_update();

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
            IF NOT (ov.deny) IS NULL THEN
                permission := permission & ~ov.deny;
            END IF;
            IF NOT (ov.allow) IS NULL THEN
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

SELECT username, name, permissions
from guild_members
         INNER JOIN users u on u.id = guild_members.user_id
         INNER JOIN guilds g on g.id = guild_members.guild_id
WHERE guild_id = 6861355209106463456;


select *
from roles;

SELECT *,
       (
           SELECT bit_or(permissions)
           FROM roles
           WHERE roles.id = 6861355209106463456
              OR roles.id IN (SELECT role_id
                              FROM role_members
                              WHERE guild_id = guild_members.guild_id
                                AND user_id = guild_members.user_id))
from guild_members
where guild_id = 6861355209106463456
  AND user_id IN (SELECT user_id
                  FROM role_members
                  WHERE role_id = 6875750381835475712
                    AND role_members.guild_id = 6861355209106463456);