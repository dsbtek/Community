from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Group, GroupMembership
from .serializers import (
    GroupSerializer, GroupListSerializer, GroupCreateSerializer,
    JoinGroupSerializer, GroupMembershipSerializer
)


class GroupViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for managing groups.

    Provides endpoints for listing, creating, retrieving, updating and deleting groups.
    """
    queryset = Group.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'list':
            return GroupListSerializer
        elif self.action == 'create':
            return GroupCreateSerializer
        return GroupSerializer

    def get_queryset(self):
        """Filter groups based on query parameters, support search."""
        queryset = super().get_queryset()

        # Filter by 'mine' param (groups created by or joined by the logged-in user)
        mine = self.request.query_params.get('mine')
        user = self.request.user
        if mine in ['1', 'true', 'True'] and user.is_authenticated:
            queryset = queryset.filter(
                (Q(creator=user) | Q(memberships__user=user))
            ).distinct()

        # Search by group name (case-insensitive)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset.order_by('-created_at')

    @swagger_auto_schema(
        operation_description="Get list of all groups",
        responses={200: GroupListSerializer(many=True)}
    )
    def list(self, request):
        """List all groups with pagination, search, and count."""
        queryset = self.get_queryset()
        # Pagination
        limit = request.query_params.get('limit')
        offset = request.query_params.get('offset')
        try:
            limit = int(limit) if limit is not None else 10
            offset = int(offset) if offset is not None else 0
        except ValueError:
            limit = 10
            offset = 0
        total_count = queryset.count()
        paginated = queryset[offset:offset+limit]
        serializer = self.get_serializer(paginated, many=True)
        return Response({
            "message": "Groups retrieved successfully",
            "groups": serializer.data,
            "count": total_count
        })

    @swagger_auto_schema(
        operation_description="Get details of a specific group",
        responses={
            200: GroupSerializer(),
            404: openapi.Response('Group not found')
        }
    )
    def retrieve(self, request, pk=None):
        """Get group details by ID, always include is_member and creator.id"""
        group = get_object_or_404(Group, pk=pk)
        serializer = self.get_serializer(group, context={'request': request})
        data = serializer.data
        # Ensure is_member and creator.id are present
        if 'is_member' not in data:
            data['is_member'] = False
        if 'creator' not in data or not data['creator']:
            data['creator'] = {'id': None}
        elif 'id' not in data['creator']:
            data['creator']['id'] = None
        return Response({
            "message": "Group retrieved successfully",
            "group": data
        })

    @swagger_auto_schema(
        operation_description="Create a new group",
        request_body=GroupCreateSerializer,
        responses={201: GroupSerializer()}
    )
    def create(self, request):
        """Create a new group"""
        print("Creating group with data:", request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()

        # Return the created group with full details
        response_serializer = GroupSerializer(
            group, context={'request': request})
        return Response({
            "message": "Group created successfully",
            "group": response_serializer.data
        }, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_description="Join a group",
        responses={
            200: openapi.Response('Successfully joined group'),
            400: openapi.Response('Bad request'),
            404: openapi.Response('Group not found')
        }
    )
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        """Join a group"""
        group = get_object_or_404(Group, pk=pk)
        serializer = JoinGroupSerializer(
            data={},
            context={'request': request, 'group': group}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": f"Successfully joined group '{group.name}'",
            "group_id": group.id,
            "user_id": request.user.id
        })

    @swagger_auto_schema(
        operation_description="Leave a group",
        responses={
            200: openapi.Response('Successfully left group'),
            400: openapi.Response('Bad request'),
            404: openapi.Response('Group not found')
        }
    )
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, pk=None):
        """Leave a group"""
        group = get_object_or_404(Group, pk=pk)

        # Check if user is a member
        membership = GroupMembership.objects.filter(
            group=group, user=request.user).first()
        if not membership:
            return Response({
                "error": "You are not a member of this group"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Don't allow creator to leave their own group
        if group.creator == request.user:
            return Response({
                "error": "Group creators cannot leave their own group"
            }, status=status.HTTP_400_BAD_REQUEST)

        membership.delete()

        return Response({
            "message": f"Successfully left group '{group.name}'",
            "group_id": group.id,
            "user_id": request.user.id
        })
