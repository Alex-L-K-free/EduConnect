from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('subjects', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subject',
            name='description',
        ),
        migrations.AddField(
            model_name='subject',
            name='grade',
            field=models.CharField(default='', max_length=20, verbose_name='Класс'),
            preserve_default=False,
        ),
    ] 