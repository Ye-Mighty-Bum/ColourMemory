-- phpMyAdmin SQL Dump
-- version 4.0.10.7
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Mar 01, 2016 at 06:32 AM
-- Server version: 5.6.28-76.1-log
-- PHP Version: 5.4.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `killersl_codetest`
--

-- --------------------------------------------------------

--
-- Table structure for table `highscores`
--

CREATE TABLE IF NOT EXISTS `highscores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `score` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=8 ;

--
-- Dumping data for table `highscores`
--

INSERT INTO `highscores` (`id`, `name`, `email`, `score`) VALUES
(1, 'Adrian Liew', 'dreamweaver3d@gmail.com', 2),
(2, 'Charles Heng', 'c.heng@fakeemail.com', 1),
(3, 'Tester 1', 'dreamweaver3d@gmail.com', -1),
(4, 'Tester 2', 'dreamweaver3d@gmail.com', 3),
(5, 'Tester 3', 'dreamweaver3d@gmail.com', -10),
(6, 'Tester 4', 'dreamweaver3d@gmail.com', 0),
(7, 'Tester 5', 'dreamweaver3d@gmail.com', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
