let users = {};
const USERS_FILE_NAME = 'users.json';
let attempts = 0; 
let currentUser = ''; 
async function init() {
    try {
        const response = await fetch(USERS_FILE_NAME);
        if (!response.ok) throw new Error('File not found');
        users = await response.json();
    } catch (error) {
        users = {
            'ADMIN': {
                password: '',
                locked: false,
                restrictions: false
            }
        };
        await saveUsers();
    }
}
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const user = users[username];

    const checkPassword = () => {
        if (user && !user.locked) {
           if (user.password === password) {
                document.getElementById('message').textContent = '';
                if (username === 'ADMIN') {
                    document.getElementById('admin-panel').style.display = 'block';
                    document.getElementById('login').style.display = 'none';
                    currentUser = username; // Ініціалізація змінної currentUser
                } else {
                    document.getElementById('user-panel').style.display = 'block';
                    document.getElementById('login').style.display = 'none';
                    currentUser = username; // Ініціалізація змінної currentUser
                }
            } else {
                attempts++;
                showMessage('Неправильний пароль. Спробуйте ще раз.');
                if (attempts == 3) {
                    document.getElementById('username').value = '';
                    document.getElementById('password').value = '';
                    showMessage('Забагато спроб. Програма завершена!');
                    logout();
                    attempts = 0;
                }
            }
        } else {
            showMessage('Користувача не знайдено або він заблокований.');
        }
    };

    checkPassword();
}

function showMessage(message) {
    document.getElementById('message').textContent = message;
}

function logout() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('user-panel').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

function openChangePasswordModal() {
    document.getElementById('myModal').style.display = "block";
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

async function confirmChangePassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (users[currentUser].password !== oldPassword) {
        alert('Старий пароль невірний.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Паролі не співпадають. Спробуйте ще раз.');
        return;
    }

    if (users[currentUser].restrictions) {
        const hasNumber = /\d/; 
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/; 
        
        if (!hasNumber.test(newPassword) || !hasSpecialChar.test(newPassword)) {
            alert('Пароль повинен містити принаймні одну цифру та один спеціальний символ.');
            return;
        }
    }

    if (newPassword && confirmPassword) {
        users[currentUser].password = newPassword; 
        await saveUsers();
        alert('Пароль успішно змінено.');
        closeModal(); 
        clearModalFields(); 
    }
}

function clearModalFields() {
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
}

async function saveUsers() {
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = USERS_FILE_NAME;
    a.click();
    URL.revokeObjectURL(url);
}

function viewUsers() {
    alert(JSON.stringify(users, null, 2));
}

function addUser() {
    const newUsername = prompt('Введіть ім\'я нового користувача:');
    if (newUsername && !users[newUsername]) {
        users[newUsername] = { password: '', locked: false, restrictions: false };
        saveUsers(); // Перезаписуємо файл
        alert('Користувача успішно додано.');
    } else {
        alert('Користувач з таким ім\'ям вже існує або ім\'я не введено.');
    }
}

function lockUser() {
    const username = prompt('Введіть ім\'я користувача для блокування:');
    if (users[username]) {
        users[username].locked = true;
        saveUsers(); // Перезаписуємо файл
        alert(`Користувача ${username} успішно заблоковано.`);
    } else {
        alert('Користувача не знайдено.');
    }
}

function toggleRestrictions() {
    const username = prompt('Введіть ім\'я користувача для зміни обмежень:');
    if (users[username]) {
        users[username].restrictions = !users[username].restrictions;
        saveUsers(); // Перезаписуємо файл
        const status = users[username].restrictions ? 'включено' : 'вимкнено';
        alert(`Обмеження для користувача ${username} ${status}.`);
    } else {
        alert('Користувача не знайдено.');
    }
}
function showHelp() {
    const helpMenu = document.getElementById('helpMenu');
    helpMenu.style.display = helpMenu.style.display === 'none' ? 'block' : 'none';
}

function showAbout() {
    document.getElementById('aboutModal').style.display = "block";
}

function closeAbout() {
    document.getElementById('aboutModal').style.display = "none";
}

window.onload = init;
