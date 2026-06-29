# Shagikon

Статический сайт без фреймворков и сборки (нет package.json, нет node_modules). Чистый HTML/CSS/JS.

## Структура

- `index.html` — стартовая страница, стили `styles/homepage.css`
- `projects.html` — страница списка проектов, стили `styles/projects.css`
- `project-card.html` — страница карточки проекта (есть fullscreen-режим), стили `styles/project-card.css`
- `styles/main.css` — общие стили
- `script.js` — единый JS-файл для всех страниц
- `assets/` — иконки (svg), шрифты (Arial, Calibri в woff2), изображения планов (plan-1..4.png)

## Заметки

- Проект на стадии активной доработки вёрстки (карточка проекта, шапка, стили).
- Нет сборки, линтеров и тестов — изменения вносятся напрямую в HTML/CSS/JS, проверка визуально в браузере.
