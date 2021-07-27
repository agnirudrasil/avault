CREATE TABLE `users`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `password` TEXT NOT NULL,
    `tag` INT NOT NULL,
    `email` INT NOT NULL,
    `avatar_url` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL
);
ALTER TABLE
    `users` ADD PRIMARY KEY `users_id_primary`(`id`);
ALTER TABLE
    `users` ADD UNIQUE `users_email_unique`(`email`);
CREATE TABLE `guilds`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `banner_url` TEXT NOT NULL,
    `avatar_url` TEXT NOT NULL,
    `owner` INT NOT NULL
);
ALTER TABLE
    `guilds` ADD PRIMARY KEY `guilds_id_primary`(`id`);
CREATE TABLE `channels`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `created_at` TEXT NOT NULL,
    `guild` INT NOT NULL
);
ALTER TABLE
    `channels` ADD PRIMARY KEY `channels_id_primary`(`id`);
CREATE TABLE `messages`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    `channel` INT NOT NULL,
    `author` INT NOT NULL,
    `content` INT NOT NULL,
    `mentions` JSON NULL,
    `embed` JSON NULL,
    `reply` INT NULL COMMENT 'The ID of the message we want to reply to'
);
ALTER TABLE
    `messages` ADD PRIMARY KEY `messages_id_primary`(`id`);
CREATE TABLE `permissions`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` ENUM('') NOT NULL,
    `bit` INT NOT NULL COMMENT 'This will contain hexadecimal values'
);
ALTER TABLE
    `permissions` ADD PRIMARY KEY `permissions_id_primary`(`id`);
CREATE TABLE `roles`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `value` INT NOT NULL,
    `guild` INT NOT NULL
);
ALTER TABLE
    `roles` ADD PRIMARY KEY `roles_id_primary`(`id`);
CREATE TABLE `guild_members`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user` INT NOT NULL,
    `guild` INT NOT NULL
);
ALTER TABLE
    `guild_members` ADD PRIMARY KEY `guild_members_id_primary`(`id`);
CREATE TABLE `role_junction`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guild` INT NOT NULL,
    `user` INT NOT NULL,
    `role` INT NOT NULL
);
ALTER TABLE
    `role_junction` ADD PRIMARY KEY `role_junction_id_primary`(`id`);
CREATE TABLE `reactions`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `emoji` INT NOT NULL,
    `user` INT NOT NULL,
    `message` INT NOT NULL
);
ALTER TABLE
    `reactions` ADD PRIMARY KEY `reactions_id_primary`(`id`);
CREATE TABLE `emojis`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `url` TEXT NOT NULL,
    `name` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `guild` INT NOT NULL,
    `uploaded_by` INT NULL
);
ALTER TABLE
    `emojis` ADD PRIMARY KEY `emojis_id_primary`(`id`);
ALTER TABLE
    `guilds` ADD CONSTRAINT `guilds_owner_foreign` FOREIGN KEY(`owner`) REFERENCES `users`(`id`);
ALTER TABLE
    `messages` ADD CONSTRAINT `messages_channel_foreign` FOREIGN KEY(`channel`) REFERENCES `channels`(`id`);
ALTER TABLE
    `channels` ADD CONSTRAINT `channels_guild_foreign` FOREIGN KEY(`guild`) REFERENCES `guilds`(`id`);
ALTER TABLE
    `messages` ADD CONSTRAINT `messages_author_foreign` FOREIGN KEY(`author`) REFERENCES `users`(`id`);
ALTER TABLE
    `roles` ADD CONSTRAINT `roles_guild_foreign` FOREIGN KEY(`guild`) REFERENCES `guilds`(`id`);
ALTER TABLE
    `role_junction` ADD CONSTRAINT `role_junction_guild_foreign` FOREIGN KEY(`guild`) REFERENCES `guilds`(`id`);
ALTER TABLE
    `role_junction` ADD CONSTRAINT `role_junction_user_foreign` FOREIGN KEY(`user`) REFERENCES `users`(`id`);
ALTER TABLE
    `role_junction` ADD CONSTRAINT `role_junction_role_foreign` FOREIGN KEY(`role`) REFERENCES `roles`(`id`);
ALTER TABLE
    `guild_members` ADD CONSTRAINT `guild_members_user_foreign` FOREIGN KEY(`user`) REFERENCES `users`(`id`);
ALTER TABLE
    `guild_members` ADD CONSTRAINT `guild_members_guild_foreign` FOREIGN KEY(`guild`) REFERENCES `guilds`(`id`);
ALTER TABLE
    `reactions` ADD CONSTRAINT `reactions_emoji_foreign` FOREIGN KEY(`emoji`) REFERENCES `emojis`(`id`);
ALTER TABLE
    `reactions` ADD CONSTRAINT `reactions_user_foreign` FOREIGN KEY(`user`) REFERENCES `users`(`id`);
ALTER TABLE
    `reactions` ADD CONSTRAINT `reactions_message_foreign` FOREIGN KEY(`message`) REFERENCES `messages`(`id`);
ALTER TABLE
    `emojis` ADD CONSTRAINT `emojis_guild_foreign` FOREIGN KEY(`guild`) REFERENCES `guilds`(`id`);
ALTER TABLE
    `emojis` ADD CONSTRAINT `emojis_uploaded_by_foreign` FOREIGN KEY(`uploaded_by`) REFERENCES `users`(`id`);