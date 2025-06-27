from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from groups.models import Group

User = get_user_model()


def validate_post_title(value):
    """Validate post title."""
    if len(value.strip()) < 5:
        raise ValidationError('Post title must be at least 5 characters long.')

    if len(value) > 200:
        raise ValidationError('Post title cannot exceed 200 characters.')


def validate_post_content(value):
    """Validate post content."""
    if len(value.strip()) < 10:
        raise ValidationError('Post content must be at least 10 characters long.')

    # Basic spam detection
    spam_indicators = ['click here', 'buy now', 'free money', 'urgent!!!']
    if any(indicator in value.lower() for indicator in spam_indicators):
        raise ValidationError('Post content appears to be spam.')


def validate_comment_content(value):
    """Validate comment content."""
    if len(value.strip()) < 1:
        raise ValidationError('Comment cannot be empty.')

    if len(value) > 1000:
        raise ValidationError('Comment cannot exceed 1000 characters.')


class Post(models.Model):
    """
    Model representing a post within a group.
    
    Posts are created by users within specific groups and can be liked by other users.
    """
    title = models.CharField(
        max_length=200,
        validators=[validate_post_title],
        help_text="Title of the post"
    )
    content = models.TextField(
        validators=[validate_post_content],
        help_text="Content/body of the post"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',
        help_text="User who created this post"
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='posts',
        help_text="Group where this post was created"
    )
    likes = models.ManyToManyField(
        User,
        through='PostLike',
        related_name='liked_posts',
        blank=True,
        help_text="Users who liked this post"
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the post was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the post was last updated"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional image URL for the post"
    )
    image = models.ImageField(
        upload_to='post_images/',
        blank=True,
        null=True,
        help_text="Optional uploaded image for the post"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'

    def __str__(self):
        return f"{self.title} by {self.author.username} in {self.group.name}"

    @property
    def likes_count(self):
        """Return the number of likes for this post."""
        return self.likes.count()

    @property
    def comments_count(self):
        """Return the number of comments for this post."""
        return self.comments.count()

    def is_liked_by(self, user):
        """Check if a specific user has liked this post."""
        if not user.is_authenticated:
            return False
        return self.likes.filter(id=user.id).exists()


class PostLike(models.Model):
    """
    Through model for Post-User likes many-to-many relationship.
    
    Tracks when users liked posts.
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='post_likes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_likes'
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the user liked this post"
    )

    class Meta:
        unique_together = ['post', 'user']
        ordering = ['-created_at']
        verbose_name = 'Post Like'
        verbose_name_plural = 'Post Likes'

    def __str__(self):
        return f"{self.user.username} likes {self.post.title}"


class Comment(models.Model):
    """
    Model representing comments on posts.
    
    Comments are created by users on specific posts.
    """
    content = models.TextField(
        validators=[validate_comment_content],
        help_text="Content of the comment"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="User who created this comment"
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Post this comment belongs to"
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the comment was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the comment was last updated"
    )

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"
