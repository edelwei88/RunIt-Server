create table if not exists users (
  id integer PRIMARY KEY autoincrement,
  username nvarchar(50) not null,
  email nvarchar(100) not null,
  password_hash text not null
)
