create table if not exists sessions(
  userid integer not null unique,
  token text not null,
  expiredate text not null,
  FOREIGN KEY(userid) REFERENCES users(id)
)
