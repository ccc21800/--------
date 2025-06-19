  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // 阻止表单默认提交行为

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
        // 登录成功：保存用户名和角色信息
        localStorage.setItem('loggedInUsername', data.username);
        localStorage.setItem('role', data.role);
        // 跳转到主界面
        window.location.href = 'main interface.html';
      } else {
        alert(data.message || '登录失败');
      }
    } catch (error) {
      alert('服务器连接失败');
    }
  });


    // fetch('/login', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ username, password })
    // })
    // .then(res => res.json())
    // .then(data => {
    //   if (data.success) {
    //     // 登录成功，跳转到主页面（例如 main.html）
    //     window.location.href = '/main interface.html';
    //   } else {
    //     // 登录失败，可选：显示错误信息
    //     alert(data.message);
    //   }
    // });
  
// //登录验证
            // document.getElementById("loginForm").addEventListener("submit", function(event) {
            // event.preventDefault(); // 阻止默认表单跳转行为

            // const username = document.getElementById("username").value.trim();
            // const password = document.getElementById("password").value.trim();
            // const errorMsg = document.getElementById("error-msg");

            // if (!username || !password) {
            //     errorMsg.textContent = "请输入用户名和密码。";
            //     return;
            // }

            // if (username === "admin" && password === "123456") {
            //     // 管理员登录
            //     localStorage.setItem("username", username);
            // localStorage.setItem("loggedInUsername", username); 
            // localStorage.setItem("role", "admin");
            // window.location.href = "main interface.html";
            // } else {
            //     // 普通用户登录（可扩展为后台验证）
            //     localStorage.setItem("username", username);
            //     localStorage.setItem("loggedInUsername", username); 
            //     localStorage.setItem("role", "user");
            //     window.location.href = "main interface.html";
            // }
        // });