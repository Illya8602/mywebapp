#!/bin/bash
# Скрипт автоматичного розгортання варіанта №23

# 1. Встановлення ПЗ
sudo apt update
sudo apt install -y nodejs npm postgresql nginx psmisc

# 2. Налаштування користувачів
sudo useradd -m -s /bin/bash student
sudo usermod -aG sudo student
echo "23" | sudo tee /home/student/gradebook > /dev/null

sudo useradd -m -s /bin/bash operator
# Тут можна додати команду для sudoers, яку ми робили

# 3. Налаштування БД
sudo systemctl start postgresql@16-main
sudo -u postgres psql -c "CREATE USER app WITH PASSWORD '12345678';"
sudo -u postgres psql -c "CREATE DATABASE mywebapp OWNER app;"

# 4. Копіювання конфігів та запуск сервісів
# (Припускаємо, що конфіги лежать у папці configs/)
sudo cp ../configs/mywebapp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mywebapp.service

# 5. Налаштування Nginx
sudo cp ../configs/nginx_conf /etc/nginx/sites-available/mywebapp
sudo ln -s /etc/nginx/sites-available/mywebapp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
