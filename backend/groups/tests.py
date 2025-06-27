from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Group, GroupMembership

User = get_user_model()


class GroupModelTest(TestCase):
    """Test cases for Group model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )

    def test_create_group(self):
        """Test creating a group."""
        group = Group.objects.create(
            name='Test Group',
            description='This is a test group for testing purposes.',
            creator=self.user
        )
        
        self.assertEqual(group.name, 'Test Group')
        self.assertEqual(group.creator, self.user)
        self.assertEqual(group.members_count, 1)  # Creator is automatically added
        
        # Check that creator is automatically added as admin
        membership = GroupMembership.objects.get(group=group, user=self.user)
        self.assertEqual(membership.role, GroupMembership.ADMIN)

    def test_group_name_validation(self):
        """Test group name validation."""
        # Test short name
        with self.assertRaises(ValidationError):
            group = Group(
                name='ab',
                description='Valid description for testing.',
                creator=self.user
            )
            group.full_clean()

        # Test invalid characters
        with self.assertRaises(ValidationError):
            group = Group(
                name='Test@Group!',
                description='Valid description for testing.',
                creator=self.user
            )
            group.full_clean()

    def test_group_description_validation(self):
        """Test group description validation."""
        # Test short description
        with self.assertRaises(ValidationError):
            group = Group(
                name='Valid Group Name',
                description='Short',
                creator=self.user
            )
            group.full_clean()

    def test_unique_group_name(self):
        """Test that group names must be unique."""
        Group.objects.create(
            name='Unique Group',
            description='This is a unique group for testing.',
            creator=self.user
        )
        
        # Try to create another group with the same name
        with self.assertRaises(Exception):  # IntegrityError
            Group.objects.create(
                name='Unique Group',
                description='Another group with the same name.',
                creator=self.user
            )


class GroupAPITest(APITestCase):
    """Test cases for Group API endpoints."""

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

    def test_list_groups_unauthenticated(self):
        """Test listing groups without authentication."""
        response = self.client.get('/api/groups/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_group_authenticated(self):
        """Test creating a group with authentication."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': 'API Test Group',
            'description': 'This is a test group created via API.'
        }
        
        response = self.client.post('/api/groups/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that group was created
        group = Group.objects.get(name='API Test Group')
        self.assertEqual(group.creator, self.user)

    def test_create_group_unauthenticated(self):
        """Test creating a group without authentication."""
        data = {
            'name': 'Unauthorized Group',
            'description': 'This should not be created.'
        }
        
        response = self.client.post('/api/groups/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_join_group(self):
        """Test joining a group."""
        # Create a group
        group = Group.objects.create(
            name='Joinable Group',
            description='A group that can be joined.',
            creator=self.user
        )
        
        # Other user joins the group
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(f'/api/groups/{group.id}/join/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that user is now a member
        membership = GroupMembership.objects.get(group=group, user=self.other_user)
        self.assertEqual(membership.role, GroupMembership.MEMBER)

    def test_join_group_already_member(self):
        """Test joining a group when already a member."""
        group = Group.objects.create(
            name='Already Member Group',
            description='A group for testing duplicate joins.',
            creator=self.user
        )
        
        # User is already a member (creator)
        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/groups/{group.id}/join/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
