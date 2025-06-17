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

// ✅ 重写后的签到模块（接入后端）
function initSignin() {
    const signinBtn = document.getElementById('signin-btn');
    const message = document.getElementById('signin-message');
    const pointDisplay = document.getElementById('point-count');
    const todayStr = new Date().toLocaleDateString();

    document.getElementById('current-date').textContent =
        `当前时间是：${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date().getDate()}日`;

    if (!username) {
        message.textContent = '请先登录';
        signinBtn.disabled = true;
        return;
    }

    // 获取用户信息（积分 & 是否今日已签到）
    fetch(`http://localhost:3000/user-info?username=${username}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                pointDisplay.textContent = `当前积分：${data.integral}`;
                if (data.last_signin === todayStr) {
                    signinBtn.disabled = true;
                    message.textContent = '今日已签到 ✔️';
                }
            } else {
                message.textContent = '用户数据加载失败';
            }
        });

    signinBtn.addEventListener('click', () => {
        fetch('http://localhost:3000/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                pointDisplay.textContent = `当前积分：${data.integral}`;
                message.textContent = '签到成功！获得10积分';
                signinBtn.disabled = true;
            } else {
                message.textContent = data.message || '签到失败';
            }
        })
        .catch(() => {
            message.textContent = '服务器连接失败';
        });
    });
}

// 积分展示（只展示，积分来源已由后端控制）
function initPoints() {
    const pointDisplay = document.getElementById('point-count');
    if (role === 'admin') {
        pointDisplay.textContent = '当前积分：∞';
    } else {
        fetch(`http://localhost:3000/user-info?username=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    pointDisplay.textContent = `当前积分：${data.integral}`;
                }
            });
    }
}

// 商城商品展示+添加+兑换
const POINT_KEY = 'user_points'; // 本地只用于存已拥有物品的处理
function initShop() {
    const redeemButtons = document.querySelectorAll('.change-btn');
    const pointCount = document.getElementById('point-count');

    redeemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cost = parseInt(button.getAttribute('data-cost'));
            const itemName = button.getAttribute('data-name');

            if (role === 'admin') {
                alert(`兑换成功！获得：${itemName}`);
                pointCount.textContent = `当前积分：∞`;
            } else {
                fetch(`http://localhost:3000/user-info?username=${username}`)
                    .then(res => res.json())
                    .then(data => {
                        let currentPoints = data.integral || 0;
                        if (currentPoints >= cost) {
                            // 扣积分请求
                            fetch('http://localhost:3000/redeem', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ username, cost, item: itemName })
                            })
                            .then(res => res.json())
                            .then(result => {
                                if (result.success) {
                                    pointCount.textContent = `当前积分：${result.integral}`;
                                    alert(`兑换成功！获得：${itemName}`);
                                    let ownedItems = JSON.parse(localStorage.getItem('owned_items')) || [];
                                    ownedItems.push(itemName);
                                    localStorage.setItem('owned_items', JSON.stringify(ownedItems));
                                    loadOwnedItems();
                                } else {
                                    alert(result.message || '兑换失败');
                                }
                            });
                        } else {
                            alert('积分不足，无法兑换该商品。');
                        }
                    });
            }
        });
    });
}

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

