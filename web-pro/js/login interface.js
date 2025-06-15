            //登录验证
            document.getElementById("loginForm").addEventListener("submit", function(event) {
            event.preventDefault(); // 阻止默认表单跳转行为

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const errorMsg = document.getElementById("error-msg");

            if (!username || !password) {
                errorMsg.textContent = "请输入用户名和密码。";
                return;
            }

            if (username === "admin" && password === "123456") {
                // 管理员登录
                localStorage.setItem("username", username);
                localStorage.setItem("role", "admin");
                window.location.href = "main interface.html";
            } else {
                // 普通用户登录（可扩展为后台验证）
                localStorage.setItem("username", username);
                localStorage.setItem("role", "user");
                window.location.href = "main interface.html";
            }
        });