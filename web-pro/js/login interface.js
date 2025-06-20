document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('loggedInUsername', username);
        window.location.href = 'main interface.html';
      }else {
      alert(data.message); // 登录失败才弹窗提示
    }
    } catch (err) {
      console.error(err);
      alert('登录失败，请检查网络或服务器状态');
    }
  });