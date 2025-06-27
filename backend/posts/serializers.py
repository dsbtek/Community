from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, PostLike, Comment
from groups.models import Group
from groups.serializers import UserBasicSerializer

User = get_user_model()


class GroupBasicSerializer(serializers.ModelSerializer):
    """Basic group serializer for nested representations."""
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model."""
    author = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Create a new comment with the current user as author."""
        request = self.context.get('request')
        post = self.context.get('post')
        validated_data['author'] = request.user
        validated_data['post'] = post
        return super().create(validated_data)


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model with full details."""
    author = UserBasicSerializer(read_only=True)
    group = GroupBasicSerializer(read_only=True)
    likes_count = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.ImageField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'group', 'likes_count',
            'comments_count', 'is_liked', 'comments', 'created_at', 'updated_at', 'image_url', 'image'
        ]
        read_only_fields = ['id', 'author', 'group', 'created_at', 'updated_at', 'image', 'image_url']

    def get_is_liked(self, obj):
        """Check if the current user has liked this post."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_liked_by(request.user)
        return False


class PostListSerializer(serializers.ModelSerializer):
    """Simplified serializer for post lists."""
    author = UserBasicSerializer(read_only=True)
    group = GroupBasicSerializer(read_only=True)
    likes_count = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    image = serializers.ImageField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'group', 'likes_count',
            'comments_count', 'is_liked', 'created_at', 'image_url', 'image'
        ]
        read_only_fields = ['id', 'author', 'group', 'created_at', 'image', 'image_url']

    def get_is_liked(self, obj):
        """Check if the current user has liked this post."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_liked_by(request.user)
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new posts."""
    group_id = serializers.IntegerField(write_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Post
        fields = ['title', 'content', 'group_id', 'image']

    def validate_group_id(self, value):
        """Validate that the group exists and user is a member."""
        try:
            group = Group.objects.get(id=value)
        except Group.DoesNotExist:
            raise serializers.ValidationError("Group does not exist.")
        
        request = self.context.get('request')
        if not group.members.filter(id=request.user.id).exists():
            raise serializers.ValidationError("You must be a member of this group to post.")
        
        return value

    def create(self, validated_data):
        """Create a new post with the current user as author."""
        request = self.context.get('request')
        group_id = validated_data.pop('group_id')
        group = Group.objects.get(id=group_id)
        
        validated_data['author'] = request.user
        validated_data['group'] = group
        return super().create(validated_data)


class PostUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating posts."""
    
    class Meta:
        model = Post
        fields = ['title', 'content']

    def validate(self, attrs):
        """Validate that the user can update this post."""
        request = self.context.get('request')
        post = self.instance
        
        if post.author != request.user:
            raise serializers.ValidationError("You can only edit your own posts.")
        
        return attrs


class PostLikeSerializer(serializers.Serializer):
    """Serializer for liking/unliking posts."""
    
    def validate(self, attrs):
        """Validate that user can like the post."""
        request = self.context.get('request')
        
        if not request.user.is_authenticated:
            raise serializers.ValidationError("You must be logged in to like posts.")
        
        return attrs

    def save(self):
        """Toggle like status for the post."""
        request = self.context.get('request')
        post = self.context.get('post')
        
        like, created = PostLike.objects.get_or_create(
            post=post,
            user=request.user
        )
        
        if not created:
            # Unlike the post
            like.delete()
            return {'liked': False, 'likes_count': post.likes_count}
        else:
            # Like the post
            return {'liked': True, 'likes_count': post.likes_count}
