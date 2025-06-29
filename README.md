# Community App

A full-stack web application for building communities, creating groups, and sharing posts. Built with Django (DRF) backend and React + Tailwind CSS frontend.
Site link: https://community-git-staging-dsbteks-projects.vercel.app/

---

## Features

-   User registration and login (JWT token-based authentication)
-   Create and manage groups
-   Create posts within groups
-   Public feed: anyone can view all posts
-   Only authenticated users can create groups or posts

---

## Tech Stack

-   **Backend:** Django, Django Rest Framework
-   **Database:** MySQL (or SQLite for development)
-   **Frontend:** React, Tailwind CSS

---

## Prerequisites

-   Python 3.8+
-   Node.js 16+
-   npm or yarn
-   MySQL (for production) or SQLite (for development)

---

## Backend Setup (Django)

1. **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd Community/backend
    ```

2. **Create a virtual environment and activate it:**

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4. **Configure environment variables:**

    - Copy `.env.example` to `.env` and set your database and secret key values.
    - By default, SQLite is used for development. For MySQL, update `DATABASES` in `settings.py`.

5. **Apply migrations:**

    ```bash
    python manage.py migrate
    ```

6. **Create a superuser (admin):**

    ```bash
    python manage.py createsuperuser
    ```

7. **Run the backend server:**
    ```bash
    python manage.py runserver
    ```

---

## Frontend Setup (React)

1. **Navigate to the frontend directory:**

    ```bash
    cd ../frontend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Start the frontend development server:**

    ```bash
    npm start
    # or
    yarn start
    ```

4. **Access the app:**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:8000](http://localhost:8000)

---

## Environment Variables

-   **Backend:**
    -   `.env` file for Django secret key, DB credentials, etc.
-   **Frontend:**
    -   See `src/utils/getApiUrl.ts` for API base URL config.

---

## Useful Commands

-   Run backend tests:
    ```bash
    python manage.py test
    ```
-   Run frontend tests:
    ```bash
    npm test
    # or
    yarn test
    ```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
