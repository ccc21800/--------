// 登录与身份识别
const role = localStorage.getItem('role') || 'user';
const username = localStorage.getItem('loggedInUsername');

if (!username) {
    alert('请先登录！');
    window.location.href = 'loginInterface.html';
}
// 页面初始化
window.addEventListener('load', () => {
    initTabs();
    initSignin();
    initPoints();
    initShop();
    initOwnedItems();
    initAdminView();
    renderUsername();
});
// 标签切换函数
function initTabs() {
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            const target = tab.getAttribute('data-tab');

            if (target === 'tab6' && role !== 'admin') {
                alert('无权限访问该页面！');
                return;
            }

            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            if (target === 'tab4') loadOwnedItems();
            if (target === 'tab2') loadProducts();
        });
    });
}
// 签到模块
function initSignin() {
    const signinBtn = document.getElementById('signin-btn');
    const message = document.getElementById('signin-message');
    const todayStr = new Date().toISOString().split('T')[0];
    const lastSignin = localStorage.getItem('last_signin_date');

    if (lastSignin === todayStr) {
        signinBtn.disabled = true;
        message.textContent = '今日已签到 ✔️';
    }

    signinBtn.addEventListener('click', () => {
        if (localStorage.getItem('last_signin_date') === todayStr) {
            message.textContent = '您今天已经签到过了！';
            return;
        }

        let points = parseInt(localStorage.getItem('user_points') || 0);
        points += 10;
        localStorage.setItem('user_points', points);
        localStorage.setItem('last_signin_date', todayStr);
        document.getElementById('point-count').textContent = `当前积分：${points}`;
        message.textContent = '签到成功！获得10积分';
        signinBtn.disabled = true;
    });

    // 日期显示
    const date = new Date();
    document.getElementById('current-date').textContent = `当前时间是：${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
// 积分展示
function initPoints() {
    const pointDisplay = document.getElementById('point-count');
    const points = localStorage.getItem('user_points') || 0;
    pointDisplay.textContent = role === 'admin' ? '当前积分：∞' : `当前积分：${points}`;
}
// 商城商品展示+添加+兑换
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

// 个人物品管理
function initOwnedItems() {
    document.querySelector('[data-tab="tab4"]').addEventListener('click', loadOwnedItems);
}

function loadOwnedItems() {
    const items = JSON.parse(localStorage.getItem('owned_items') || '[]');
    const list = document.getElementById('owned-items-list');
    list.innerHTML = '';
    items.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        list.appendChild(li);
    });
}
// 用户名与权限控制
function renderUsername() {
    document.getElementById('displayName').textContent = `${localStorage.getItem('loggedInUsername')}，`;
}

function logout() {
    localStorage.removeItem('loggedInUsername');
    localStorage.removeItem('role');
    window.location.href = 'loginInterface.html';
}
// 管理员界面权限控制
function initAdminView() {
    const adminTab = document.querySelector('[data-tab="tab6"]');
    const adminContent = document.getElementById('tab6');

    if (role !== 'admin') {
        adminTab.style.display = 'none';
        adminContent.innerHTML = "<p style='text-align: center; color: red;'>无权限访问</p>";
    }
}
