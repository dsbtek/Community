from django.contrib.auth.models import AbstractUser
from django.db import models


def user_avatar_path(instance, filename):
    return f'avatars/user_{instance.id}/{filename}'


class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    avatar = models.ImageField(upload_to=user_avatar_path, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email
