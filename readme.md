##### Для работы с пользователем(signup/login/logout)

- POST /api/users/signup - для регистрации
- POST /api/users/login - для получения токена
- GET /api/users/current - для того, чтобы узнать текщего пользователя (необходимо добавить тип токена и сам токен в поле афторизации полученный после логина)
- GET /api/users/logout - для обнуления токена

##### Для работы с контактами

- GET /api/contacts
- GET /api/contacts/:id
- POST /api/contacts
- DELETE /api/contacts/:id
- PUT /api/contacts/:id
- PUTCH /api/contacts/:id/favorite

### Команды:

- `npm start` &mdash; старт сервера в режиме production
- `npm run start:dev` &mdash; старт сервера в режиме разработки (development)
- `npm run lint` &mdash; запустить выполнение проверки кода с eslint, необходимо выполнять перед каждым PR и исправлять все ошибки линтера
- `npm lint:fix` &mdash; та же проверка линтера, но с автоматическими исправлениями простых ошибок
