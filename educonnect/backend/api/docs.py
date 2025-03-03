"""
API Documentation

User Authentication:
------------------
POST /api/v1/login/
    Request:
        {
            "username": string,
            "password": string
        }
    Response:
        {
            "token": string,
            "username": string,
            "role": string["admin", "teacher", "student"]
        }

Student Registration:
------------------
POST /api/v1/students/verify/
    Request:
        {
            "lastName": string,
            "firstName": string,
            "middleName": string (optional)
        }
    Response:
        {
            "exists": boolean,
            "message": string
        }

POST /api/v1/students/register/
    Request:
        {
            "username": string,
            "password": string,
            "first_name": string,
            "last_name": string,
            "middle_name": string (optional),
            "role": "student"
        }
    Response:
        {
            "message": string,
            "username": string
        }
""" 