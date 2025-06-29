# Testing Stack Audit and Recommendations

## Project Overview

This Community project is a full-stack application with a clear separation between backend and frontend components:

- **Backend**: Django REST API (`/backend`)
- **Frontend**: React application (`/frontend`)

## Backend Testing Stack

### Technology Stack
- **Language/Runtime**: Python 3.x
- **Framework**: Django 4.2.7
- **API Framework**: Django REST Framework 3.14.0
- **Database**: SQLite (development), MySQL/PostgreSQL (production)

### Recommended Test Runner
- **Primary**: **pytest** with pytest-django
- **Alternative**: Django's built-in unittest framework

### Current Testing Structure
- Some test files already exist:
  - `backend/groups/tests.py`
  - `backend/posts/tests.py`

### Recommended Directory Conventions
```
backend/
├── tests/                          # Global test utilities and fixtures
│   ├── __init__.py
│   ├── conftest.py                 # pytest fixtures
│   ├── test_settings.py            # Test-specific Django settings
│   └── fixtures/                   # Test data fixtures
├── accounts/
│   ├── tests/                      # App-specific tests
│   │   ├── __init__.py
│   │   ├── test_models.py
│   │   ├── test_views.py
│   │   ├── test_serializers.py
│   │   └── test_urls.py
│   └── ...
├── groups/
│   ├── tests/
│   │   └── ... (similar structure)
│   └── ...
└── posts/
    ├── tests/
    │   └── ... (similar structure)
    └── ...
```

### Required Dev Dependencies
Add to `requirements-dev.txt` or `requirements.txt`:
```
pytest>=7.4.0
pytest-django>=4.5.0
pytest-cov>=4.1.0
factory-boy>=3.3.0
faker>=19.0.0
pytest-mock>=3.11.0
```

### Testing Configuration
Create `pytest.ini` in backend root:
```ini
[tool:pytest]
DJANGO_SETTINGS_MODULE = community.settings
python_files = tests.py test_*.py *_tests.py
addopts = --cov=. --cov-report=html --cov-report=term-missing
testpaths = .
```

## Frontend Testing Stack

### Technology Stack
- **Framework**: React 18.2.0
- **Language**: TypeScript/JavaScript
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Styling**: Tailwind CSS 3.3.5

### Current Test Runner
- **Primary**: **Jest** (included with react-scripts)
- **Testing Library**: React Testing Library 13.4.0
- **DOM Testing**: @testing-library/jest-dom 5.17.0

### Current Testing Structure
- Test setup files exist:
  - `frontend/src/setupTests.js`
  - `frontend/src/App.test.js`

### Recommended Directory Conventions
```
frontend/src/
├── __tests__/                      # Global test utilities
│   ├── test-utils.tsx              # Custom render functions
│   └── mocks/                      # Mock data and services
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.test.tsx         # Component tests
│   │   └── __tests__/              # Additional test files
│   └── Profile/
│       ├── Profile.tsx
│       └── Profile.test.tsx
├── pages/
│   ├── Home/
│   │   ├── Home.tsx
│   │   └── Home.test.tsx
│   └── ...
├── utils/
│   ├── api.ts
│   ├── api.test.ts                 # Utility function tests
│   └── ...
└── hooks/
    ├── useAuth.ts
    └── useAuth.test.ts             # Custom hook tests
```

### Current Dev Dependencies (Already Installed)
```json
{
  "@testing-library/jest-dom": "^5.17.0",
  "@testing-library/react": "^13.4.0",
  "@testing-library/user-event": "^13.5.0"
}
```

### Additional Recommended Dev Dependencies
Consider adding:
```json
{
  "@testing-library/react-hooks": "^8.0.1",
  "msw": "^1.3.0",
  "jest-environment-jsdom": "^29.0.0"
}
```

### Testing Configuration
The project uses Create React App's built-in Jest configuration. Custom configuration can be added to `package.json`:

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/index.tsx",
      "!src/reportWebVitals.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Test Execution Commands

### Backend
```bash
# Install dependencies
pip install -r requirements-dev.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific app tests
pytest accounts/tests/

# Run specific test file
pytest accounts/tests/test_models.py
```

### Frontend
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode
npm test -- --ci --watchAll=false
```

## Integration Testing

### API Testing
- Use Django's `TestCase` or pytest with `django.test.Client`
- Consider using `requests` for full API integration tests
- Test authentication with JWT tokens

### End-to-End Testing
Consider adding:
- **Cypress** or **Playwright** for full E2E testing
- **Selenium** for browser automation if needed

## Continuous Integration

### Recommended GitHub Actions Structure
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && python manage.py test
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test -- --ci --coverage
```

## Summary

The project is well-structured for testing with:
- **Backend**: Django + DRF with pytest as the recommended test runner
- **Frontend**: React + TypeScript with Jest + React Testing Library
- Clear separation of concerns allowing independent testing of each layer
- Existing test files provide a foundation to build upon

Next steps would be to implement the recommended directory structure and add the suggested dev dependencies.
