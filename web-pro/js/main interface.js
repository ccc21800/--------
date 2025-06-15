        //选项标签内容切换
        const tabLinks = document.querySelectorAll('.tab-link')
        const tabContents = document.querySelectorAll('.tab-content')
        
        tabLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetTab = this.getAttribute('data-tab');

        // 管理界面权限判断
        if (targetTab === "tab6" && role !== "admin") {
            alert("无权限访问该页面！");
            return;
        }

        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(targetTab).classList.add('active');
    });
});
        //日期显示
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth() + 1
        const day = today.getDate()
        const formattedDate = `${year}年${month}月${day}日`
        document.getElementById("current-date").innerText = `当前时间是：${formattedDate}`
        //签到功能
        const todayStr = today.toISOString().split('T')[0]// 用于签到限制
        // 积分签到功能
        const signinBtn = document.getElementById('signin-btn')
        const signinMessage = document.getElementById('signin-message')
        const pointCount = document.getElementById('point-count')
        const POINT_KEY = 'user_points'
        const SIGNIN_DATE_KEY = 'last_signin_date'
        const DAILY_REWARD = 10
        // 初始化积分
        let points = parseInt(localStorage.getItem(POINT_KEY)) || 0
        pointCount.textContent = `当前积分：${points}`
        // 检查是否已签到
        const lastSignin = localStorage.getItem(SIGNIN_DATE_KEY)
        if (lastSignin === todayStr) {
        signinBtn.disabled = true;
        signinMessage.textContent = '今日已签到 ✔️'
        }
        // 签到点击事件
        signinBtn.addEventListener('click', function () {
        const currentSigninDate = localStorage.getItem(SIGNIN_DATE_KEY)
        if (currentSigninDate === todayStr) {
            signinMessage.textContent = '您今天已经签过到了！'
            return
        }
        points += DAILY_REWARD
        localStorage.setItem(POINT_KEY, points)
        localStorage.setItem(SIGNIN_DATE_KEY, todayStr)
        if (role === "admin") {
        pointCount.textContent = `当前积分：∞`
        } else {
        pointCount.textContent = `当前积分：${points}`
        }   
        signinMessage.textContent = '签到成功！获得10积分'
        signinBtn.disabled = true
    })
        //个人主页显示用户名
            document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('loggedInUsername');
    if (username) {
        document.getElementById('displayName').textContent = username + '，';
    }
    });
    //     const username = localStorage.getItem("username"); // 从浏览器获取存储的用户名
    //     document.getElementById("displayName").textContent = username || "游客"; // 显示用户名或默认“游客”
    //     // 登录成功时：
localStorage.clear(); // 清除之前的用户信息
// 退出登录
    function logout() {
    localStorage.removeItem('loggedInUsername');
    window.location.href = 'loginInterface.html'; // 返回登录页
    }
// 存储当前用户信息
localStorage.setItem("loggedInUsername", username);
localStorage.setItem("role", admin); // "admin" 或 "user"

        // 商品兑换（支持同步到个人物品）
        const redeemButtons = document.querySelectorAll('.change-btn')
        redeemButtons.forEach(button => {
        button.addEventListener('click', () => {
        const cost = parseInt(button.getAttribute('data-cost'))
        const itemName = button.getAttribute('data-name') // 获取商品名称
        let currentPoints = parseInt(localStorage.getItem(POINT_KEY)) || 0

        if (role === "admin" || currentPoints >= cost) {
        if (role !== "admin") {
        currentPoints -= cost
        localStorage.setItem(POINT_KEY, currentPoints)
        pointCount.textContent = `当前积分：${currentPoints}`
        } else {
        pointCount.textContent = `当前积分：∞`
    }   
    alert(`兑换成功！获得：${itemName}`)
    // 添加到个人物品
    let ownedItems = JSON.parse(localStorage.getItem('owned_items')) || []
    ownedItems.push(itemName)
    localStorage.setItem('owned_items', JSON.stringify(ownedItems))
    // 立即刷新个人物品列表
    loadOwnedItems()
    } else {
        alert('积分不足，无法兑换该商品。')
    }
        })
    })
                // ✅ 保存到个人物品
    //             function loadOwnedItems() {
    // // 从 localStorage 获取已拥有的物品数组（JSON 字符串 -> JavaScript 数组）
    //             const ownedItems = JSON.parse(localStorage.getItem('owned_items')) || []
    // // 获取页面中用于显示物品的列表容器
    //             const list = document.getElementById('owned-items-list')
    // // 清空旧的列表（防止重复添加）
    //             list.innerHTML = ''
    // // 遍历物品数组，将每个物品添加为 <li> 元素
    //             ownedItems.forEach(item => {
    //                 const li = document.createElement('li')
    //                 li.textContent = item
    //                 list.appendChild(li)
    //                 })
    // }
    //购买物品在个人物品显示
    function loadOwnedItems() {
    const ownedItems = JSON.parse(localStorage.getItem('owned_items')) || []
    const list = document.getElementById('owned-items-list')
    list.innerHTML = '' // 清空旧内容
    ownedItems.forEach(item => {
        const li = document.createElement('li')
        li.textContent = item
        list.appendChild(li)
    })
}
// 在页面加载完后调用
window.addEventListener('load', loadOwnedItems)
// 每次切换到“个人物品”页面时也刷新一下显示
document.querySelector('[data-tab="tab4"]').addEventListener('click', loadOwnedItems)
    //管理界面进入权限
    // 获取用户角色
const role = localStorage.getItem("role") || "user"; // 默认是普通用户

// 获取管理界面的菜单项和内容容器
const adminTabLink = document.querySelector('[data-tab="tab6"]');
const adminTabContent = document.getElementById("tab6");

// 如果不是管理员，隐藏菜单项并禁止访问管理内容
if (role !== "admin") {
    if (adminTabLink) adminTabLink.style.display = "none";
    if (adminTabContent) adminTabContent.innerHTML = "<p style='color:red; text-align:center;'>无权限访问此内容。</p>";
}

    // const role = localStorage.getItem("role")
    // const tab6 = document.querySelector('[data-tab="tab6"]')
    // const content6 = document.getElementById("tab6")
    // if (role !== "admin") {
    //     if (tab6) tab6.style.display = "none"
    //     if (content6) content6.innerHTML = "<p style='color:red;'>无权限访问此内容。</p>"
    // }
//     const role = localStorage.getItem("role") || "user"// 默认普通用户
//     const adminLink = document.querySelector('[data-tab="tab6"]')
// // 如果不是管理员，隐藏“管理界面”菜单项
// // if (role !== "admin") {
// //     adminLink.style.display = "none"
// // }
//添加商品
const productList = document.querySelector('#tab2 .box1')
// 监听表单提交
document.getElementById('add-product-form').addEventListener('submit', function (e) {
    e.preventDefault()
    const name = document.getElementById('product-name').value.trim()
    const points = parseInt(document.getElementById('product-points').value)
    const img = document.getElementById('product-img').value.trim()
    if (!name || !points || !img) return alert('请填写所有字段！')
    const newProduct = {
        name, points, img
    }
    // 保存到 localStorage
    const products = JSON.parse(localStorage.getItem('products')) || []
    products.push(newProduct)
    localStorage.setItem('products', JSON.stringify(products))
    // 添加到页面
    appendProductToStore(newProduct)
    // 清空表单
    this.reset()
})
// 载入商品（页面加载或切换到商城时）
function loadProducts() {
    productList.innerHTML = '' // 清空原商品列表
    const products = JSON.parse(localStorage.getItem('products')) || []
    products.forEach((p, i) => appendProductToStore(p, i))
}
// 添加单个商品到商城 DOM
function appendProductToStore(product, index = null) {
    const li = document.createElement('li')
    li.innerHTML = `
        <img src="${product.img}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
        <h3 style="text-align: center;">${product.name}</h3>
        <p style="text-align: center;">积分：${product.points}</p>
        <button class="change-btn" data-cost="${product.points}" data-name="${product.name}" style="display: block; margin: 10px auto;">兑换</button>
        ${role === "admin" ? '<button class="delete-btn" style="background-color: red; display: block; margin: 0 auto; margin-top: 10px;">删除</button>' : ''}
    `

    // 兑换按钮逻辑
    li.querySelector('.change-btn').addEventListener('click', function () {
        const cost = product.points
        const itemName = product.name
        let currentPoints = parseInt(localStorage.getItem(POINT_KEY)) || 0

        if (role === "admin" || currentPoints >= cost) {
            if (role !== "admin") {
                currentPoints -= cost
                localStorage.setItem(POINT_KEY, currentPoints)
                pointCount.textContent = `当前积分：${currentPoints}`
            } else {
                pointCount.textContent = `当前积分：∞`
            }
            alert(`兑换成功！获得：${itemName}`)
            let ownedItems = JSON.parse(localStorage.getItem('owned_items')) || []
            ownedItems.push(itemName)
            localStorage.setItem('owned_items', JSON.stringify(ownedItems))
            loadOwnedItems()
        } else {
            alert('积分不足，无法兑换该商品。')
        }
    })

    // 删除按钮逻辑（仅管理员可见）
    if (role === "admin") {
        const deleteBtn = li.querySelector('.delete-btn')
        deleteBtn.addEventListener('click', function () {
            if (confirm('确定要删除这个商品吗？')) {
                let products = JSON.parse(localStorage.getItem('products')) || []
                products.splice(index, 1)
                localStorage.setItem('products', JSON.stringify(products))
                loadProducts() // 重新加载商品
            }
        })
    }

    productList.appendChild(li)
}
    // 添加兑换按钮事件
    li.querySelector('.change-btn').addEventListener('click', handleRedeem)
    window.addEventListener('load', loadProducts)
    document.querySelector('[data-tab="tab2"]').addEventListener('click', loadProducts)
    