-- USERS TABLE
CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `avatar_url` VARCHAR(255) DEFAULT NULL,
    `anime_count` SMALLINT UNSIGNED DEFAULT 0,
    `anime_episodes` INT UNSIGNED DEFAULT 0,
    `manga_count` SMALLINT UNSIGNED DEFAULT 0,
    `manga_chapters` INT UNSIGNED DEFAULT 0,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- COMMENTS TABLE
CREATE TABLE `comments` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `anime_id` VARCHAR(50) NOT NULL,
    `episode_id` SMALLINT UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `is_spoiler` TINYINT(1) DEFAULT 0,
    `parent_id` INT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_anime_episode` (`anime_id`, `episode_id`),
    KEY `idx_user` (`user_id`),
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- COMMENT REACTIONS
CREATE TABLE `comment_reactions` (
    `comment_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED NOT NULL,
    `type` TINYINT(1) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`comment_id`, `user_id`),
    CONSTRAINT `fk_reaction_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WATCHED EPISODE
CREATE TABLE `watched_episode` (
    `user_id` INT UNSIGNED NOT NULL,
    `anime_id` VARCHAR(50) NOT NULL,
    `episodes_watched` VARCHAR(500) NOT NULL,  -- store small JSON or comma-separated numbers
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `anime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WATCHLIST
CREATE TABLE `watchlist` (
    `user_id` INT UNSIGNED NOT NULL,
    `anime_id` VARCHAR(50) NOT NULL,
    `anime_name` VARCHAR(255) NOT NULL,
    `type` TINYINT(1) NOT NULL COMMENT '1=Watching, 2=On-Hold, 3=Plan, 4=Dropped, 5=Completed',
    `poster` VARCHAR(255) DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `anime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WATCH HISTORY
CREATE TABLE `watch_history` (
    `user_id` INT UNSIGNED NOT NULL,
    `anime_id` VARCHAR(50) NOT NULL,
    `last_episode` SMALLINT UNSIGNED DEFAULT 1,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `anime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAGEVIEWS
CREATE TABLE `pageview` (
    `pageID` VARCHAR(100) NOT NULL,
    `totalview` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `like_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `dislike_count` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`pageID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
