from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('subjects', 'XXXX_alter_subject_fields'),  # Укажите предыдущую миграцию
    ]

    operations = [
        migrations.AlterField(
            model_name='subject',
            name='code',
            field=models.CharField(max_length=50, unique=True, verbose_name='Код предмета'),
        ),
    ] 