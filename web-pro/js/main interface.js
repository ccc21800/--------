// 登录与身份识别
let role = 'user'; // 默认角色为 user
const username = localStorage.getItem('loggedInUsername');
if (!username) {
    alert('请先登录！');
    window.location.href = 'loginInterface.html';
} else {
    // 从数据库查询身份信息
    fetch(`http://localhost:3000/getRole?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                role = data.role;
                localStorage.setItem('role', role); // 如果你希望保留，也可以设置
                // 初始化页面内容
                initPage();
            } else {
                alert('获取身份失败：' + data.message);
                window.location.href = 'loginInterface.html';
            }
        })
        .catch(err => {
            console.error('角色请求失败', err);
            alert('服务器连接失败');
            window.location.href = 'loginInterface.html';
        });
}

// 页面初始化
function initPage() {
    initTabs();
    initSignin();
    initPoints();
    initShop();
    initOwnedItems();
    initAdminView();
    renderUsername();
}

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

function loadProducts() {
    fetch('http://localhost:3000/api/commodities')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const ul = document.getElementById('commodity-list');
                ul.innerHTML = '';
                data.commodities.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <img src="${item.image_url || ''}" alt="${item.trade_name}" style="width: 100%; height: 200px; object-fit: cover;">
                        <h3 style="text-align: center;">${item.trade_name}</h3>
                        <p style="text-align: center;">积分：${item.price}</p>
                        <button class="change-btn" data-cost="${item.price}" data-name="${item.trade_name}" style="display: block; margin: 10px auto;">兑换</button>
                        ${role === 'admin' ? `<button class="delete-btn" data-id="${item.id}" style="display: block; margin: 10px auto;">删除</button>` : ''}
                    `;
                    ul.appendChild(li);
                });

                // 绑定兑换按钮事件（已有逻辑复用）
                initShop();

                // 绑定删除按钮事件（管理员专用）
                if (role === 'admin') {
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const id = btn.getAttribute('data-id');
                            if (confirm('确定删除该商品？')) {
                                const res = await fetch(`http://localhost:3000/api/commodities/${id}`, { method: 'DELETE' });
                                const result = await res.json();
                                if (result.success) {
                                    alert('商品已删除');
                                    loadProducts(); // 刷新商品列表
                                } else {
                                    alert('删除失败');
                                }
                            }
                        });
                    });
                }
            }
        });
}

function initAdminView() {
    const adminTab = document.querySelector('[data-tab="tab6"]');
    const adminContent = document.getElementById('tab6');

    if (role !== 'admin') {
        adminTab.style.display = 'none';
        adminContent.innerHTML = "<p style='text-align: center; color: red;'>无权限访问</p>";
    } else {
        // 绑定添加商品事件
        const form = document.getElementById('add-product-form');
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const trade_name = document.getElementById('product-name').value.trim();
            const price = parseInt(document.getElementById('product-points').value);
            const image_url = document.getElementById('product-img').value.trim();

            if (!trade_name || price < 0 || !image_url) {
                alert('请填写完整的商品信息');
                return;
            }

            const res = await fetch('http://localhost:3000/api/commodities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trade_name, price, image_url })
            });

            const result = await res.json();
            if (result.success) {
                alert('商品添加成功');
                form.reset();
                loadProducts(); // 商城自动刷新商品列表
            } else {
                alert('添加失败：' + result.message);
            }
        });
    }
}
