-- BrainsterMath Database Schema
-- MySQL/TiDB Compatible

-- Drop tables if they exist (for clean setup)
-- DROP TABLE IF EXISTS activity_log;
-- DROP TABLE IF EXISTS level_requests;
-- DROP TABLE IF EXISTS videos;
-- DROP TABLE IF EXISTS students;
-- DROP TABLE IF EXISTS admins;

-- Admins Table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- Students Table
-- CREATE TABLE students (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255),
--     phone VARCHAR(50),
--     address TEXT,
--     level INT NOT NULL DEFAULT 1,
--     accessible_levels JSON DEFAULT '[]',
--     firebase_uid VARCHAR(255) UNIQUE,
--     auth_provider ENUM('email', 'google') DEFAULT 'email',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT chk_level CHECK (level >= 1 AND level <= 8),
--     INDEX idx_email (email),
--     INDEX idx_firebase_uid (firebase_uid),
--     INDEX idx_level (level)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    level INT NOT NULL DEFAULT 1,
    accessible_levels JSON,
    firebase_uid VARCHAR(255) UNIQUE,
    auth_provider ENUM('email', 'google') DEFAULT 'email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_level CHECK (level >= 1 AND level <= 8),
    INDEX idx_email (email),
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Videos Table
CREATE TABLE videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level INT NOT NULL,
    sheet_start INT NOT NULL,
    sheet_end INT NOT NULL,
    video_url TEXT NOT NULL,
    video_key VARCHAR(500),
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_video_level CHECK (level >= 1 AND level <= 8),
    CONSTRAINT chk_sheets CHECK (sheet_start >= 1 AND sheet_start <= 200 AND sheet_end >= sheet_start AND sheet_end <= 200),
    INDEX idx_level (level),
    INDEX idx_sheets (sheet_start, sheet_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Log Table
CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    sheet INT NOT NULL,
    slide ENUM('A', 'B') NOT NULL,
    level INT NOT NULL,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_accessed_at (accessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Level Requests Table
CREATE TABLE level_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    current_level INT NOT NULL,
    requested_level INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
