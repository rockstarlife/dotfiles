#!/usr/bin/env fish

# Удаляем старый плагин
hyprpm remove split-monitor-workspaces

# Добавляем репозиторий плагина заново
hyprpm add https://github.com/Duckonaut/split-monitor-workspaces

# Устанавливаем и активируем плагин
hyprpm enable split-monitor-workspaces

# Перезагружаем плагины
hyprpm reload
