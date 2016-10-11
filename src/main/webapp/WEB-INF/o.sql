CREATE TABLE `o_selector` (
 `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
 `url` varchar(255) DEFAULT '',
 `paths` longtext,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;


CREATE TABLE `o_pic` (
 `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
 `name` varchar(500) DEFAULT '',
 `country` varchar(500) DEFAULT '',
`url` varchar(500) DEFAULT '',
`path` varchar(500) DEFAULT '',
`image` varchar(500) DEFAULT '',
`link` varchar(500) DEFAULT '',
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

