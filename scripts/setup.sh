#!/bin/bash
# Скрипт автоматичного розгортання варіанта №23

# 1. Встановлення ПЗ
sudo apt update
sudo apt install -y nodejs npm postgresql nginx psmisc

# 2. Налаштування користувачів та Gradebook
sudo useradd -m -s /bin/bash student || true
sudo usermod -aG sudo student
echo "23" | sudo tee /home/student/gradebook > /dev/null
sudo chown student:student /home/student/gradebook

sudo useradd -m -s /bin/bash operator || true
sudo useradd -r -s /usr/sbin/nologin app || true # Користувач для сервісу

# 3. Налаштування БД
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE USER app WITH PASSWORD '12345678';" || true
sudo -u postgres psql -c "CREATE DATABASE mywebapp OWNER app;" || true

# 4. Налаштування прав (критично!)
sudo chmod o+x /home/aming
sudo chmod o+x /home/aming/mywebapp
sudo chown -R aming:app /home/aming/mywebapp/src
sudo chmod -R 750 /home/aming/mywebapp/src

# 5. Копіювання конфігів та запуск
# Шляхи вказуємо відносно твоєї структури
sudo cp /home/aming/mywebapp/src/mywebapp.socket /etc/systemd/system/
sudo cp /home/aming/mywebapp/src/mywebapp.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now mywebapp.socket

# 6. Налаштування Nginx
sudo cp /home/aming/mywebapp/src/nginx_conf /etc/nginx/sites-available/mywebapp
sudo ln -sf /etc/nginx/sites-available/mywebapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# 7. Sudoers для Operator
echo "operator ALL=(ALL) NOPASSWD: /usr/bin/systemctl start mywebapp, /usr/bin/systemctl stop mywebapp, /usr/bin/systemctl restart mywebapp, /usr/bin/systemctl status mywebapp, /usr/sbin/nginx -s reload" | sudo tee /etc/sudoers.d/operator
sudo chmod 0440 /etc/sudoers.d/operator

echo "Готово! Перевіряй http://localhost"
