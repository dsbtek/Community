# How to use Dockerfile.prod for Production Deployment

1. **Build the production image:**

    ```sh
    docker build -f Dockerfile.prod -t community-app-prod .
    ```

2. **Run the container:**

    ```sh
    docker run -p 8080:8080 --env-file .env community-app-prod
    ```

    - Make sure your `.env` file contains all required environment variables (e.g., `SECRET_KEY`, `DATABASE_URL`, etc).

3. **Static files:**

    - Static files will be collected to `/app/staticfiles` and served by WhiteNoise via Gunicorn.

4. **For Railway or other platforms:**
    - If the platform supports custom Dockerfiles, point it to `Dockerfile.prod`.
    - If using the default buildpack (Procfile), your current setup is already correct.

---

**Note:**

-   For local development, continue using the default `Dockerfile` or `runserver`.
-   For production, always use Gunicorn and WhiteNoise as in `Dockerfile.prod`.

If you need a custom entrypoint, health check, or environment-specific tweaks, let me know!
