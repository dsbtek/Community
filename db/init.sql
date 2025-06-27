-- Initialize the community database
CREATE DATABASE IF NOT EXISTS community_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'community_user'@'%' IDENTIFIED BY 'community_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON community_db.* TO 'community_user'@'%';
FLUSH PRIVILEGES;
