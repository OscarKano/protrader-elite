// ProTrader Elite - Улучшенная версия
class ProTraderApp {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('protrader_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('protrader_current_user')) || null;
        this.init();
    }

    init() {
        console.log('🚀 ProTrader Elite запущен');
        this.setupEventListeners();
        this.updateUI();
        this.checkAuth();
    }

    setupEventListeners() {
        // Форма регистрации
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            this.setupRealTimeValidation(registerForm);
        }

        // Форма входа
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Выход
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    setupRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        switch(field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                message = isValid ? '' : 'Введите корректный email';
                break;
            case 'password':
                isValid = value.length >= 6;
                message = isValid ? '' : 'Пароль должен содержать минимум 6 символов';
                break;
            case 'text':
                isValid = value.length >= 2;
                message = isValid ? '' : 'Имя должно содержать минимум 2 символа';
                break;
        }

        this.setFieldState(field, isValid, message);
        return isValid;
    }

    setFieldState(field, isValid, message) {
        field.style.borderColor = isValid ? '#4caf50' : '#f44336';
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.color = '#f44336';
        errorElement.style.fontSize = '0.9rem';
        errorElement.style.marginTop = '5px';
    }

    clearFieldError(field) {
        field.style.borderColor = '#e9ecef';
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('registerName').value.trim(),
            email: document.getElementById('registerEmail').value.trim(),
            password: document.getElementById('registerPassword').value.trim()
        };

        // Валидация всех полей
        const fields = e.target.querySelectorAll('input[required]');
        let allValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                allValid = false;
            }
        });

        if (!allValid) {
            this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        // Показываем загрузку
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;

        // Имитация задержки сети
        await this.delay(1000);

        try {
            const result = this.register(formData);
            
            if (result.success) {
                this.showNotification('🎉 Регистрация прошла успешно!', 'success');
                await this.delay(1500);
                window.location.href = 'dashboard.html';
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Произошла ошибка при регистрации', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        // Показываем загрузку
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Вход...';
        submitBtn.disabled = true;

        await this.delay(800);

        try {
            const result = this.login(email, password);
            
            if (result.success) {
                this.showNotification('✅ Вход выполнен!', 'success');
                await this.delay(1000);
                window.location.href = 'dashboard.html';
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка при входе в систему', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    register(userData) {
        // Проверяем существующего пользователя
        if (this.users.find(user => user.email === userData.email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            balance: 5000,
            premium: false,
            registrationDate: new Date().toISOString(),
            trades: [],
            portfolio: {
                total: 5000,
                stocks: 0,
                crypto: 0,
                cash: 5000
            }
        };

        this.users.push(newUser);
        localStorage.setItem('protrader_users', JSON.stringify(this.users));
        
        // Автоматический вход после регистрации
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
        this.showNotification('👋 До встречи!', 'info');
        this.currentUser = null;
        localStorage.removeItem('protrader_current_user');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    checkAuth() {
        if (this.currentUser && window.location.pathname.includes('login.html')) {
            window.location.href = 'dashboard.html';
        }
        
        if (!this.currentUser && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }

    updateUI() {
        const userMenu = document.querySelector('.user-menu');
        if (!userMenu) return;

        if (this.currentUser) {
            userMenu.innerHTML = `
                <span style="color: white; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user"></i>
                    ${this.currentUser.name}
                    ${this.currentUser.premium ? '<span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">PREMIUM</span>' : ''}
                </span>
                <a href="dashboard.html" class="btn">
                    <i class="fas fa-chart-line"></i>
                    Кабинет
                </a>
                <button class="btn btn-secondary logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    Выйти
                </button>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Создаем или находим контейнер уведомлений
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
            `;
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        // Показываем уведомление
        setTimeout(() => notification.classList.add('show'), 100);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    window.app = new ProTraderApp();
});
