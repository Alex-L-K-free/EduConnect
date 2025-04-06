from django.core.management.base import BaseCommand
from users_student.models import StudentUser
from subjects.models import Subject, SubjectEnrollment
from django.db import transaction

class Command(BaseCommand):
    help = 'Синхронизирует предметы между legacy полем и таблицей SubjectEnrollment'

    def handle(self, *args, **options):
        self.stdout.write('Starting subject synchronization...')
        
        with transaction.atomic():
            # Удаляем все существующие записи в SubjectEnrollment
            SubjectEnrollment.objects.all().delete()
            self.stdout.write('Cleared existing enrollments')
            
            # Для каждого студента
            for student in StudentUser.objects.all():
                self.stdout.write(f'Processing student {student.username}')
                
                if student.subject:  # Если есть legacy предметы
                    subject_names = [name.strip() for name in student.subject.split(',') if name.strip()]
                    self.stdout.write(f'Found legacy subjects: {subject_names}')
                    
                    for subject_name in subject_names:
                        try:
                            # Получаем или создаем предмет
                            subject = Subject.objects.get(name=subject_name)
                            self.stdout.write(f'Found subject: {subject.name}')
                            
                            # Создаем запись в SubjectEnrollment
                            SubjectEnrollment.objects.create(
                                student=student,
                                subject=subject
                            )
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'Created enrollment for student {student.username} and subject {subject.name}'
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
            
            self.stdout.write(self.style.SUCCESS('Successfully synchronized subjects')) 