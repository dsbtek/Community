from django.http import JsonResponse
from django.db import connection
from rest_framework.decorators import api_view


@api_view(['GET'])
def health_check(request):
    try:
        connection.ensure_connection()
        return JsonResponse({'status': 'ok'}, status=200)
    except Exception as e:
        return JsonResponse({'status': 'error', 'detail': str(e)}, status=500)
