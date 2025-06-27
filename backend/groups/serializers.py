from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group, GroupMembership

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for nested representations."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']


class GroupMembershipSerializer(serializers.ModelSerializer):
    """Serializer for group membership information."""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = GroupMembership
        fields = ['user', 'role', 'joined_at']
        read_only_fields = ['joined_at']


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Group model with full details."""
    creator = UserBasicSerializer(read_only=True)
    members_count = serializers.ReadOnlyField()
    memberships = GroupMembershipSerializer(many=True, read_only=True)
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'creator', 'members_count',
            'memberships', 'is_member', 'user_role', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']

    def get_is_member(self, obj):
        """Check if the current user is a member of this group."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

    def get_user_role(self, obj):
        """Get the current user's role in this group."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            return membership.role if membership else None
        return None

    def create(self, validated_data):
        """Create a new group with the current user as creator."""
        request = self.context.get('request')
        validated_data['creator'] = request.user
        return super().create(validated_data)


class GroupListSerializer(serializers.ModelSerializer):
    """Simplified serializer for group lists."""
    creator = UserBasicSerializer(read_only=True)
    members_count = serializers.ReadOnlyField()
    is_member = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'creator', 'members_count',
            'is_member', 'created_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at']

    def get_is_member(self, obj):
        """Check if the current user is a member of this group."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False


class GroupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new groups."""
    
    class Meta:
        model = Group
        fields = ['name', 'description']

    def validate_name(self, value):
        """Validate that group name is unique (case-insensitive)."""
        if Group.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A group with this name already exists.")
        return value

    def create(self, validated_data):
        """Create a new group with the current user as creator."""
        request = self.context.get('request')
        validated_data['creator'] = request.user
        return super().create(validated_data)


class JoinGroupSerializer(serializers.Serializer):
    """Serializer for joining a group."""
    
    def validate(self, attrs):
        """Validate that user can join the group."""
        request = self.context.get('request')
        group = self.context.get('group')
        
        if not request.user.is_authenticated:
            raise serializers.ValidationError("You must be logged in to join a group.")
        
        if group.members.filter(id=request.user.id).exists():
            raise serializers.ValidationError("You are already a member of this group.")
        
        return attrs

    def save(self):
        """Add user to the group."""
        request = self.context.get('request')
        group = self.context.get('group')
        
        GroupMembership.objects.create(
            group=group,
            user=request.user,
            role=GroupMembership.MEMBER
        )
        
        return group
