from django.conf import settings

class SkipSSLRedirectForHealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Match both /api/health and /api/health/
        if (
            getattr(settings, 'SECURE_SSL_REDIRECT', False)
            and request.path.rstrip('/') == "/api/health"
            and not request.is_secure()
        ):
            # Serve the health check without redirecting
            return self.get_response(request)
        return self.get_response(request)
