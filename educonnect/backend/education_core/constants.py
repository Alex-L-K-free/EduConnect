"""
Field name constants for consistent usage across the application
"""

# Common User Fields
USERNAME = 'username'
PASSWORD = 'password'
FIRST_NAME = 'first_name'
LAST_NAME = 'last_name'
MIDDLE_NAME = 'middle_name'
ROLE = 'role'

# Student Fields
STUDENT_FIRST_NAME = 'firstName'  # Legacy camelCase
STUDENT_LAST_NAME = 'lastName'    # Legacy camelCase
STUDENT_MIDDLE_NAME = 'middleName'  # Legacy camelCase
GRADE = 'grade'
INDEX = 'index'
SUBJECT = 'subject'

# API Response Fields
TOKEN = 'token'
MESSAGE = 'message'
ERROR = 'error'
EXISTS = 'exists'

# Roles
ROLE_ADMIN = 'admin'
ROLE_TEACHER = 'teacher'
ROLE_STUDENT = 'student'

# Field Mappings (for future migration from camelCase to snake_case)
FIELD_MAPPINGS = {
    STUDENT_FIRST_NAME: FIRST_NAME,
    STUDENT_LAST_NAME: LAST_NAME,
    STUDENT_MIDDLE_NAME: MIDDLE_NAME,
}

TEACHER = 'teacher'  # Добавьте это определение 