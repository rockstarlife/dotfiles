#!/usr/bin/env bash

# Зависимости: tesseract, imagemagick, wl-clipboard, grimblast, notify-send (dunst/mako)

die() {
  notify-send "$1" && exit 1
}

cleanup() {
  [[ -n $1 ]] && rm -r "$1"
}

SCR_IMG=$(mktemp -d) || die "Не удалось создать временную папку"

trap "cleanup '$SCR_IMG'" EXIT

# Скриншот области с grimblast
grimblast --notify save area "$SCR_IMG/scr.png" || die "Ошибка скриншота"

sleep 0.1 # Пауза для обработки

# Обработка: grayscale + увеличение x4 для лучшего OCR
mogrify -modulate 100,0 -resize 400% "$SCR_IMG/scr.png" || die "Ошибка обработки изображения"

# OCR: извлечение текста
tesseract "$SCR_IMG/scr.png" "$SCR_IMG/scr" -l rus+eng &>/dev/null || die "Ошибка OCR"

# Копирование в буфер
wl-copy <"$SCR_IMG/scr.txt" || die "Ошибка копирования в буфер"

notify-send "OCR готово" "Текст скопирован в буфер" || true

exit 0
