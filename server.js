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
  const filePath = path.join(__dirname, 'web-pro', 'registration interface.html');
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
  const { stuid, username, password } = req.body;

  if (!stuid || !username || !password) {
    return res.json({ success: false, message: '学号，用户名和密码不能为空' });
  }

//   const hashedPassword = bcrypt.hashSync(password, 10);

  // 判断是否是管理员账号（你可以自定义条件）
  let role = 'user';
  if (stuid === 'admin001' || username.toLowerCase() === 'admin') {
    role = 'admin';
  }

  const sql = 'INSERT INTO user (stuid, username, password, role) VALUES (?, ?, ?, ?)';
  db.execute(sql, [stuid, username, password, role], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.json({ success: false, message: '用户名已存在' });
      }
      console.error(err);
      return res.json({ success: false, message: '注册失败' });
    }

    res.json({ success: true, message: `注册成功！您已被授予${role === 'admin' ? '管理员' : '普通用户'}权限` });
  });
});

app.listen(3000, () => {
  console.log('后端服务器已启动：http://localhost:3000');
});

app.post('/signin', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.json({ success: false, message: '用户名缺失' });
  }

  const today = new Date().toLocaleDateString();

  const getSql = 'SELECT integral, last_signin FROM user WHERE username = ?';
  db.execute(getSql, [username], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, message: '获取用户信息失败' });
    }

    const user = results[0];
    if (user.last_signin === today) {
      return res.json({ success: false, message: '今天已经签过到了' });
    }

    const currentPoints = Number(user.integral) || 0;
    const newPoints = currentPoints + 10;

    const updateSql = 'UPDATE user SET integral = ?, last_signin = ? WHERE username = ?';
    db.execute(updateSql, [newPoints, today, username], (updateErr) => {
      if (updateErr) {
        return res.json({ success: false, message: '更新积分失败' });
      }

      res.json({ success: true, integral: newPoints });
    });
  });
});

app.get('/user-info', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.json({ success: false, message: '缺少用户名' });
  }

  const sql = 'SELECT integral, last_signin FROM user WHERE username = ?';
  db.execute(sql, [username], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, message: '用户不存在' });
    }

    res.json({ 
      success: true, 
      integral: results[0].integral, 
      last_signin: results[0].last_signin || ''
    });
  });
});

app.post('/redeem', (req, res) => {
  const { username, cost, itemName } = req.body;

  if (!username || !cost || !itemName) {
    return res.json({ success: false, message: '缺少必要信息' });
  }

  const getSql = 'SELECT integral FROM user WHERE username = ?';
  db.execute(getSql, [username], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, message: '用户不存在' });
    }

    const userPoints = results[0].integral || 0;

    if (userPoints < cost) {
      return res.json({ success: false, message: '积分不足' });
    }

    const newPoints = userPoints - cost;
    const updateSql = 'UPDATE user SET integral = ? WHERE username = ?';

    db.execute(updateSql, [newPoints, username], (updateErr) => {
      if (updateErr) {
        return res.json({ success: false, message: '积分扣除失败' });
      }

      res.json({ success: true, integral: newPoints, message: `兑换成功，获得：${itemName}` });
    });
  });
});

app.post('/api/commodities', (req, res) => {
  const { trade_name, price, image_url } = req.body;

  if (!trade_name || !price) {
    return res.status(400).json({ success: false, message: '商品名称和价格不能为空' });
  }

  const sql = 'INSERT INTO commodity (trade_name, price, image_url ) VALUES (?, ?, ?)';
  const values = [
    trade_name,
    price,
    image_url || ''  //默认空字符串
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('插入商品失败:', err);
      return res.status(500).json({ success: false, message: '数据库错误' });
    }

    res.json({ success: true, message: '商品添加成功', id: result.insertId });
  });
});

// 获取所有商品信息
app.get('/api/commodities', (req, res) => {
  const sql = 'SELECT id, trade_name, price, image_url FROM commodity';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('查询商品失败:', err);
      return res.status(500).json({ success: false, message: '数据库错误' });
    }
    res.json({ success: true, commodities: results });
  });
});

app.delete('/api/commodities/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM commodity WHERE id = ?';
  db.execute(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: '删除失败' });
    res.json({ success: true, message: '删除成功' });
  });
});

app.get('/getRole', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ success: false, message: '用户名不能为空' });
  }

  const sql = 'SELECT role FROM user WHERE username = ?';
  db.execute(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '数据库查询错误' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, role: results[0].role });
  });
});
