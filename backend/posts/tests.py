from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from groups.models import Group, GroupMembership
from .models import Post, PostLike, Comment

User = get_user_model()


class PostModelTest(TestCase):
    """Test cases for Post model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.group = Group.objects.create(
            name='Test Group',
            description='This is a test group for testing purposes.',
            creator=self.user
        )

    def test_create_post(self):
        """Test creating a post."""
        post = Post.objects.create(
            title='Test Post Title',
            content='This is a test post content that is long enough to pass validation.',
            author=self.user,
            group=self.group
        )
        
        self.assertEqual(post.title, 'Test Post Title')
        self.assertEqual(post.author, self.user)
        self.assertEqual(post.group, self.group)
        self.assertEqual(post.likes_count, 0)
        self.assertEqual(post.comments_count, 0)

    def test_post_title_validation(self):
        """Test post title validation."""
        # Test short title
        with self.assertRaises(ValidationError):
            post = Post(
                title='Hi',
                content='This is a valid content that is long enough.',
                author=self.user,
                group=self.group
            )
            post.full_clean()

    def test_post_content_validation(self):
        """Test post content validation."""
        # Test short content
        with self.assertRaises(ValidationError):
            post = Post(
                title='Valid Title Here',
                content='Short',
                author=self.user,
                group=self.group
            )
            post.full_clean()

        # Test spam content
        with self.assertRaises(ValidationError):
            post = Post(
                title='Valid Title Here',
                content='Click here for free money! Buy now urgent!!!',
                author=self.user,
                group=self.group
            )
            post.full_clean()

    def test_post_like_functionality(self):
        """Test post like functionality."""
        post = Post.objects.create(
            title='Likeable Post',
            content='This is a post that can be liked by users.',
            author=self.user,
            group=self.group
        )
        
        # Create another user to like the post
        other_user = User.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password='testpass123'
        )
        
        # Like the post
        PostLike.objects.create(post=post, user=other_user)
        
        self.assertEqual(post.likes_count, 1)
        self.assertTrue(post.is_liked_by(other_user))
        self.assertFalse(post.is_liked_by(self.user))


class PostAPITest(APITestCase):
    """Test cases for Post API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password='testpass123'
        )
        self.group = Group.objects.create(
            name='Test Group',
            description='This is a test group for testing purposes.',
            creator=self.user
        )
        # Add other_user to the group
        GroupMembership.objects.create(
            group=self.group,
            user=self.other_user,
            role=GroupMembership.MEMBER
        )

    def test_list_posts_unauthenticated(self):
        """Test listing posts without authentication."""
        response = self.client.get('/api/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_post_authenticated(self):
        """Test creating a post with authentication."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'API Test Post',
            'content': 'This is a test post created via API with enough content.',
            'group_id': self.group.id
        }
        
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that post was created
        post = Post.objects.get(title='API Test Post')
        self.assertEqual(post.author, self.user)
        self.assertEqual(post.group, self.group)

    def test_create_post_unauthenticated(self):
        """Test creating a post without authentication."""
        data = {
            'title': 'Unauthorized Post',
            'content': 'This should not be created because user is not authenticated.',
            'group_id': self.group.id
        }
        
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_post_not_group_member(self):
        """Test creating a post when not a member of the group."""
        # Create a new user who is not a member of the group
        non_member = User.objects.create_user(
            email='nonmember@example.com',
            username='nonmember',
            password='testpass123'
        )
        
        self.client.force_authenticate(user=non_member)
        
        data = {
            'title': 'Unauthorized Group Post',
            'content': 'This should not be created because user is not a group member.',
            'group_id': self.group.id
        }
        
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_like_post(self):
        """Test liking a post."""
        post = Post.objects.create(
            title='Likeable Post',
            content='This is a post that can be liked via API.',
            author=self.user,
            group=self.group
        )
        
        # Other user likes the post
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(f'/api/posts/{post.id}/like/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['liked'])
        self.assertEqual(response.data['likes_count'], 1)

    def test_unlike_post(self):
        """Test unliking a post."""
        post = Post.objects.create(
            title='Unlikeable Post',
            content='This is a post that can be unliked via API.',
            author=self.user,
            group=self.group
        )
        
        # First like the post
        PostLike.objects.create(post=post, user=self.other_user)
        
        # Then unlike it
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(f'/api/posts/{post.id}/like/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['liked'])
        self.assertEqual(response.data['likes_count'], 0)

    def test_filter_posts_by_group(self):
        """Test filtering posts by group."""
        # Create posts in different groups
        other_group = Group.objects.create(
            name='Other Group',
            description='Another group for testing.',
            creator=self.other_user
        )
        
        Post.objects.create(
            title='Post in Test Group',
            content='This post is in the test group.',
            author=self.user,
            group=self.group
        )
        
        Post.objects.create(
            title='Post in Other Group',
            content='This post is in the other group.',
            author=self.other_user,
            group=other_group
        )
        
        # Filter by test group
        response = self.client.get(f'/api/posts/?group_id={self.group.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['posts']), 1)
        self.assertEqual(response.data['posts'][0]['title'], 'Post in Test Group')
