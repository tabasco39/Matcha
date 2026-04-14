-- Migration: Création de la table users pour Matcha

CREATE DATABASE IF NOT EXISTS matcha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE matcha;

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  bio         TEXT         DEFAULT NULL,
  birth_date  DATE         DEFAULT NULL,
  gender      VARCHAR(20)  DEFAULT NULL,
  preference  VARCHAR(20)  DEFAULT NULL,
  location    VARCHAR(55)  DEFAULT NULL,
  can_located BOOLEAN      DEFAULT NULL,
  interests   VARCHAR(500) DEFAULT NULL, -- valeurs séparées par |
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table images (max 5 par utilisateur)
CREATE TABLE IF NOT EXISTS images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  path        VARCHAR(255) NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_image_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  liked_user_id INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_like_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_like_liked_user
    FOREIGN KEY (liked_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

