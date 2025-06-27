from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.shortcuts import get_object_or_404

from .models import Post, PostLike, Comment
from .serializers import (
    PostSerializer, PostListSerializer, PostCreateSerializer,
    PostUpdateSerializer, PostLikeSerializer, CommentSerializer
)
from groups.models import Group

class PostViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for managing posts.

    Provides endpoints for listing, creating, retrieving, updating and deleting posts.
    """
    queryset = Post.objects.select_related('author', 'group').prefetch_related('comments')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'list':
            return PostListSerializer
        elif self.action == 'create':
            return PostCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PostUpdateSerializer
        return PostSerializer

    def get_queryset(self):
        """Filter posts based on query parameters."""
        queryset = super().get_queryset()

        # Filter by group
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        # Filter by author
        author_id = self.request.query_params.get('author_id')
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        # Filter by 'mine' param (only posts by the logged-in user)
        mine = self.request.query_params.get('mine')
        if mine in ['1', 'true', 'True'] and self.request.user.is_authenticated:
            queryset = queryset.filter(author=self.request.user)

        return queryset.order_by('-created_at')

    @swagger_auto_schema(
        operation_description="Get list of all posts",
        manual_parameters=[
            openapi.Parameter('group_id', openapi.IN_QUERY, description="Filter posts by group ID", type=openapi.TYPE_INTEGER),
            openapi.Parameter('author_id', openapi.IN_QUERY, description="Filter posts by author ID", type=openapi.TYPE_INTEGER),
        ],
        responses={200: PostListSerializer(many=True)}
    )
    def list(self, request):
        """List all posts with optional filtering"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "message": "Posts retrieved successfully",
            "posts": serializer.data,
            "filters": {
                "group_id": request.query_params.get('group_id'),
                "author_id": request.query_params.get('author_id')
            }
        })

    @swagger_auto_schema(
        operation_description="Get details of a specific post",
        responses={
            200: PostSerializer(),
            404: openapi.Response('Post not found')
        }
    )
    def retrieve(self, request, pk=None):
        """Get post details by ID"""
        post = get_object_or_404(Post, pk=pk)
        serializer = self.get_serializer(post)
        return Response({
            "message": "Post retrieved successfully",
            "post": serializer.data
        })

    @swagger_auto_schema(
        operation_description="Create a new post",
        request_body=PostCreateSerializer,
        responses={201: PostSerializer()}
    )
    def create(self, request):
        """Create a new post"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save()

        # Return the created post with full details
        response_serializer = PostSerializer(post, context={'request': request})
        return Response({
            "message": "Post created successfully",
            "post": response_serializer.data
        }, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_description="Like or unlike a post",
        responses={200: openapi.Response('Post liked/unliked successfully')}
    )
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = get_object_or_404(Post, pk=pk)
        serializer = PostLikeSerializer(
            data={},
            context={'request': request, 'post': post}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return Response({
            "message": f"Post {'liked' if result['liked'] else 'unliked'} successfully",
            "post_id": post.id,
            "user_id": request.user.id,
            "liked": result['liked'],
            "likes_count": result['likes_count']
        })

    @swagger_auto_schema(
        operation_description="Get comments for a post",
        responses={200: CommentSerializer(many=True)}
    )
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get all comments for a post"""
        post = get_object_or_404(Post, pk=pk)
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response({
            "message": "Comments retrieved successfully",
            "comments": serializer.data
        })

    @swagger_auto_schema(
        operation_description="Add a comment to a post",
        request_body=CommentSerializer,
        responses={201: CommentSerializer()}
    )
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, pk=None):
        """Add a comment to a post"""
        post = get_object_or_404(Post, pk=pk)
        serializer = CommentSerializer(
            data=request.data,
            context={'request': request, 'post': post}
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()

        return Response({
            "message": "Comment added successfully",
            "comment": CommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)
