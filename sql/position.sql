CREATE OR REPLACE FUNCTION position_insert(bigint) RETURNS integer AS $$
	SELECT COALESCE(MAX(position) + 1, 0) FROM channels WHERE guild_id = $1 AND parent_id IS NULL;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION position_insert(bigint, bigint) RETURNS integer AS $$
	SELECT COALESCE(MAX(position) + 1, 0) FROM channels WHERE guild_id = $1 AND parent_id = $2;
$$ LANGUAGE SQL;