document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim()
            const password = document.getElementById('password').value.trim()
            const confirmPassword = document.getElementById('confirm-password').value.trim()
            
            if(!username || !password || !confirmPassword) {
                alert('请填写完整的注册信息！')
                return false;
            }
            
            if(password !== confirmPassword) {
                alert('两次输入的密码不一致！')
                return false;
            }
            
            alert('注册成功！')
        })