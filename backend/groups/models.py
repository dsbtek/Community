from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
import re

User = get_user_model()


def validate_group_name(value):
    """Validate group name format."""
    if len(value.strip()) < 3:
        raise ValidationError('Group name must be at least 3 characters long.')

    if not re.match(r'^[a-zA-Z0-9\s\-_]+$', value):
        raise ValidationError('Group name can only contain letters, numbers, spaces, hyphens, and underscores.')

    # Check for inappropriate words (basic example)
    inappropriate_words = ['spam', 'test123', 'admin']
    if any(word in value.lower() for word in inappropriate_words):
        raise ValidationError('Group name contains inappropriate content.')


def validate_group_description(value):
    """Validate group description."""
    if len(value.strip()) < 10:
        raise ValidationError('Group description must be at least 10 characters long.')

    if len(value) > 500:
        raise ValidationError('Group description cannot exceed 500 characters.')


class Group(models.Model):
    """
    Model representing a community group.
    
    Groups are created by users and can have multiple members.
    Each group has a name, description, and tracks creation/update times.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        validators=[validate_group_name],
        help_text="Name of the group (must be unique)"
    )
    description = models.TextField(
        max_length=500,
        validators=[validate_group_description],
        help_text="Description of the group's purpose"
    )
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_groups',
        help_text="User who created this group"
    )
    members = models.ManyToManyField(
        User,
        through='GroupMembership',
        related_name='joined_groups',
        blank=True,
        help_text="Users who are members of this group"
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the group was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the group was last updated"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Group'
        verbose_name_plural = 'Groups'

    def __str__(self):
        return self.name

    @property
    def members_count(self):
        """Return the number of members in this group."""
        return self.members.count()

    def save(self, *args, **kwargs):
        """Override save to automatically add creator as a member."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Automatically add the creator as a member when group is created
            GroupMembership.objects.get_or_create(
                group=self,
                user=self.creator,
                defaults={'role': GroupMembership.ADMIN}
            )


class GroupMembership(models.Model):
    """
    Through model for Group-User many-to-many relationship.
    
    Tracks when users joined groups and their role within the group.
    """
    MEMBER = 'member'
    ADMIN = 'admin'
    
    ROLE_CHOICES = [
        (MEMBER, 'Member'),
        (ADMIN, 'Admin'),
    ]

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='group_memberships'
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=MEMBER,
        help_text="User's role in the group"
    )
    joined_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the user joined this group"
    )

    class Meta:
        unique_together = ['group', 'user']
        ordering = ['-joined_at']
        verbose_name = 'Group Membership'
        verbose_name_plural = 'Group Memberships'

    def __str__(self):
        return f"{self.user.username} in {self.group.name} ({self.role})"
