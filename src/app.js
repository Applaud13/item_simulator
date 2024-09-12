import express from 'express';
import cookieParser from 'cookie-parser';
import items from './routes/item.js'
import users from './routes/users.js'
import characters from './routes/character.js'
import play from './routes/play.js'


const app = express();
const PORT = 3018;

app.use(express.json());
app.use(cookieParser());
app.use("/api",[items, users, characters, play])

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});