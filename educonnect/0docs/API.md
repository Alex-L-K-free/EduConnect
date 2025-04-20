# API Documentation

## Аутентификация

### Получение токена
```http
POST /api/v1/token/
```

**Параметры**
```json
{
    "username": "string",
    "password": "string"
}
```

**Ответ**
```json
{
    "token": "string"
}
```

## Материалы

### Получение материалов студента
```http
GET /api/v1/materials/student/{id}/
```

**Параметры запроса**
- `subject` (опционально): Название предмета для фильтрации

**Ответ**
```json
[
    {
        "id": "integer",
        "title": "string",
        "description": "string",
        "file_url": "string",
        "subject_name": "string",
        "upload_date": "datetime",
        "uploaded_by": "string"
    }
]
```

### Добавление материала
```http
POST /api/v1/materials/add/
```

**Параметры формы**
- `file`: Файл материала
- `title`: Название материала
- `description`: Описание материала (опционально)
- `student_ids`: JSON массив ID студентов
- `subject_name`: Название предмета

**Ответ**
```json
{
    "id": "integer",
    "title": "string",
    "description": "string",
    "file_url": "string",
    "subject_name": "string",
    "upload_date": "datetime"
}
```

### Удаление материала
```http
DELETE /api/v1/materials/{id}/
```

**Ответ**
```
Status: 204 No Content
```

## Студенты

### Получение списка студентов по предмету
```http
GET /api/v1/students/by-subject/{subject_id}/
```

**Ответ**
```json
[
    {
        "id": "integer",
        "firstName": "string",
        "lastName": "string",
        "subject": "string",
        "materials": [
            {
                "id": "integer",
                "title": "string",
                "description": "string",
                "file_url": "string",
                "upload_date": "datetime"
            }
        ]
    }
]
```

### Получение списка студентов по классу
```http
GET /api/v1/students/by-class/{class_id}/
```

**Ответ**
```json
[
    {
        "id": "integer",
        "firstName": "string",
        "lastName": "string",
        "class": "string",
        "subjects": ["string"]
    }
]
```

## Предметы

### Получение списка предметов
```http
GET /api/v1/subjects/
```

**Ответ**
```json
[
    {
        "id": "integer",
        "name": "string",
        "description": "string",
        "student_count": "integer"
    }
]
```

## Классы

### Получение списка классов
```http
GET /api/v1/classes/
```

**Ответ**
```json
[
    {
        "id": "integer",
        "name": "string",
        "student_count": "integer"
    }
]
```

## Коды ошибок

- `400 Bad Request`: Неверные параметры запроса
- `401 Unauthorized`: Требуется аутентификация
- `403 Forbidden`: Недостаточно прав
- `404 Not Found`: Ресурс не найден
- `500 Internal Server Error`: Внутренняя ошибка сервера 