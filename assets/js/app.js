// ProTrader Elite - Основное приложение
console.log('ProTrader Elite загружен!');

// Система пользователей
class UserSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('protrader_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('protrader_current_user')) || null;
    }

    register(userData) {
        // Проверяем нет ли пользователя с таким email
        if (this.users.find(user => user.email === userData.email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            balance: 1000,
            registrationDate: new Date().toISOString(),
            trades: []
        };

        this.users.push(newUser);
        localStorage.setItem('protrader_users', JSON.stringify(this.users));
        
        // Автоматически входим после регистрации
        this.login(userData.email, userData.password);
        
        return { success: true, message: 'Регистрация успешна!' };
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('protrader_current_user', JSON.stringify(user));
            return { success: true, message: 'Вход выполнен!' };
        } else {
            return { success: false, message: 'Неверный email или пароль' };
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('protrader_current_user');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Инициализация системы
const userSystem = new UserSystem();

// Обработчики форм
function setupAuthForms() {
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value
            };

            const result = userSystem.register(formData);
            
            if (result.success) {
                alert(result.message);
                window.location.href = 'dashboard.html';
            } else {
                alert(result.message);
            }
        });
    }

    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const result = userSystem.login(email, password);
            
            if (result.success) {
                alert(result.message);
                window.location.href = 'dashboard.html';
            } else {
                alert(result.message);
            }
        });
    }
}

// Загрузка dashboard
function loadDashboard() {
    if (!userSystem.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = userSystem.currentUser;
    
    // Обновляем приветствие
    const welcomeElement = document.getElementById('welcomeMessage');
    if (welcomeElement) {
        welcomeElement.textContent = `Добро пожаловать, ${user.name}!`;
    }

    // Обновляем баланс
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement) {
        balanceElement.textContent = `$${user.balance}`;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
    setupAuthForms();
    
    // Если мы на dashboard, загружаем данные
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboard();
    }
    
    // Показываем/скрываем элементы в зависимости от авторизации
    updateUIBasedOnAuth();
});

function updateUIBasedOnAuth() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    if (userSystem.isLoggedIn()) {
        userMenu.innerHTML = `
            <span style="color: white; margin-right: 1rem;">${userSystem.currentUser.name}</span>
            <a href="dashboard.html" class="btn">Кабинет</a>
            <a href="#" class="btn" onclick="userSystem.logout(); window.location.href='index.html'">Выйти</a>
        `;
    }
}
