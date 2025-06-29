
from django.http import JsonResponse
from django.db import connection
from rest_framework.decorators import api_view
import os
from django.conf import settings
import subprocess



@api_view(['GET'])
def health_check(request):
    staticfiles_status = 'not-checked'
    staticfiles_error = None
    try:
        # Try to run collectstatic dry-run to check static files
        result = subprocess.run(
            [
                'python',
                'manage.py',
                'collectstatic',
                '--noinput',
                '--dry-run',
            ],
            cwd=settings.BASE_DIR,
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            staticfiles_status = 'ok'
        else:
            staticfiles_status = 'error'
            staticfiles_error = result.stderr or result.stdout
    except Exception as e:
        staticfiles_status = 'error'
        staticfiles_error = str(e)
    try:
        connection.ensure_connection()
        return JsonResponse({
            'status': 'ok',
            'staticfiles': staticfiles_status,
            'staticfiles_error': staticfiles_error,
        }, status=200)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'detail': str(e),
            'staticfiles': staticfiles_status,
            'staticfiles_error': staticfiles_error,
        }, status=500)
