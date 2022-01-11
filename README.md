# madcamp_week2_server

// DB 구조 //

Table = users;
+----------+-------------+------+-----+---------+-------+
| Field    | Type        | Null | Key | Default | Extra |
+----------+-------------+------+-----+---------+-------+
| id       | varchar(60) | NO   | PRI | NULL    |       |
| name     | varchar(20) | NO   |     | NULL    |       |
| nickname | varchar(30) | NO   |     | NULL    |       |
| email    | varchar(30) | NO   |     | NULL    |       |
| mobile   | varchar(15) | NO   |     | NULL    |       |
| place    | varchar(10) | NO   |     | NULL    |       |
+----------+-------------+------+-----+---------+-------+

Table = items;
+------------------+-------------+------+-----+-------------------+-----------------------------+
| Field            | Type        | Null | Key | Default           | Extra                       |
+------------------+-------------+------+-----+-------------------+-----------------------------+
| item_id          | int(11)     | NO   | PRI | NULL              | auto_increment              |
| user_id          | varchar(60) | NO   | MUL | NULL              |                             |
| post_time        | timestamp   | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| item_image       | mediumblob  | YES  |     | NULL              |                             |
| item_name        | varchar(30) | NO   |     | NULL              |                             |
| item_place       | varchar(20) | YES  |     | NULL              |                             |
| item_date_start  | date        | NO   |     | NULL              |                             |
| item_date_end    | date        | NO   |     | NULL              |                             |
| item_price       | int(11)     | NO   |     | NULL              |                             |
| item_description | mediumtext  | YES  |     | NULL              |                             |
| available        | int(11)     | YES  |     | NULL              |                             |
+------------------+-------------+------+-----+-------------------+-----------------------------+

Table = contracts;
+---------------+-------------+------+-----+-------------------+-----------------------------+
| Field         | Type        | Null | Key | Default           | Extra                       |
+---------------+-------------+------+-----+-------------------+-----------------------------+
| from_user     | varchar(60) | NO   | PRI | NULL              |                             |
| to_user       | varchar(60) | NO   | PRI | NULL              |                             |
| contract_item | int(11)     | NO   | PRI | NULL              |                             |
| contract_time | timestamp   | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| confirm       | int(11)     | NO   |     | NULL              |                             |
+---------------+-------------+------+-----+-------------------+-----------------------------+

Table = chatting_room;
+----------+-------------+------+-----+---------+----------------+
| Field    | Type        | Null | Key | Default | Extra          |
+----------+-------------+------+-----+---------+----------------+
| room_id  | int(11)     | NO   | PRI | NULL    | auto_increment |
| user1_id | varchar(60) | NO   | MUL | NULL    |                |
| user2_id | varchar(60) | NO   | MUL | NULL    |                |
+----------+-------------+------+-----+---------+----------------+

Table = chatting_message;
+------------+-------------+------+-----+---------+----------------+
| Field      | Type        | Null | Key | Default | Extra          |
+------------+-------------+------+-----+---------+----------------+
| message_id | int(11)     | NO   | PRI | NULL    | auto_increment |
| room_id    | int(11)     | NO   | MUL | NULL    |                |
| from_user  | varchar(60) | NO   | MUL | NULL    |                |
| content    | mediumtext  | YES  |     | NULL    |                |
| timestamp  | varchar(30) | NO   |     | NULL    |                |
+------------+-------------+------+-----+---------+----------------+
