const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'class_sim'
});


app.use(express.static(path.join(__dirname, 'web-pro')));
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'web-pro', 'loginInterface.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('服务器读取 login 页面失败');
    } else {
      res.send(data);
    }
  });
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: '用户名和密码不能为空' });
  }

  const sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
  db.execute(sql, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: '服务器错误' });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: '用户名或密码错误' });
    }

    // 登录成功
    res.json({ success: true, message: '登录成功' });
  });
});

app.post('/register', async (req, res) => {
  const { stuid,username, password } = req.body;

  if (!stuid || !username || !password) {
    return res.json({ success: false, message: '学号，用户名和密码不能为空' });
  }

//   const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO user (stuid ,username, password) VALUES (?, ?,?)';
  db.execute(sql, [ stuid ,username, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.json({ success: false, message: '用户名已存在' });
      }
      console.error(err);
      return res.json({ success: false, message: '注册失败' });
    }

    res.json({ success: true, message: '注册成功！' });
  });
});

app.listen(3000, () => {
  console.log('后端服务器已启动：http://localhost:3000');
});


