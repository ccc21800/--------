document.getElementById('registerForm').addEventListener('submit', async function (e) {
      e.preventDefault();
        const stuid = document.getElementById('stuid').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (password !== confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stuid,username, password })
        });

        const result = await response.json();
        alert(result.message);

        if (result.success) {
          window.location.href = 'loginInterface.html'; // 注册成功后跳转
        }
      } catch (error) {
        alert('注册失败，请检查服务器是否正常运行');
        console.error(error);
      }
    });