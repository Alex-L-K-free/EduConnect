from django.core.management.base import BaseCommand
from users_student.models import StudentUser
from subjects.models import Subject, SubjectEnrollment
from django.utils import timezone

class Command(BaseCommand):
    help = 'Синхронизирует записи в SubjectEnrollment с legacy полем subject'

    def handle(self, *args, **options):
        self.stdout.write('Starting enrollment sync...')
        
        # Для каждого студента
        for student in StudentUser.objects.all():
            self.stdout.write(f'Processing student {student.username}')
            
            if student.subject:  # Если есть legacy предметы
                subject_names = [name.strip() for name in student.subject.split(',') if name.strip()]
                self.stdout.write(f'Found legacy subjects: {subject_names}')
                
                for subject_name in subject_names:
                    try:
                        # Получаем предмет
                        subject = Subject.objects.get(name=subject_name)
                        self.stdout.write(f'Found subject: {subject.name}')
                        
                        # Проверяем существование записи
                        enrollment, created = SubjectEnrollment.objects.get_or_create(
                            student=student,
                            subject=subject,
                            defaults={'enrolled_at': timezone.now()}
                        )
                        
                        if created:
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'Created enrollment for student {student.username} and subject {subject.name}'
                                )
                            )
                        else:
                            self.stdout.write(
                                self.style.WARNING(
                                    f'Enrollment already exists for student {student.username} and subject {subject.name}'
                                )
                            )
                            
                    except Subject.DoesNotExist:
                        self.stdout.write(
                            self.style.ERROR(
                                f'Subject {subject_name} not found'
                            )
                        )
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'Error processing student {student.username} and subject {subject_name}: {str(e)}'
                            )
                        )
            else:
                self.stdout.write(f'No legacy subjects found for student {student.username}')
        
        self.stdout.write(self.style.SUCCESS('Successfully synced enrollments')) 