# Expense Tracker

A full-stack expense tracking application built with FastAPI (Python) backend, React TypeScript frontend, and PostgreSQL database.

## Tech Stack

- **Backend**: Python FastAPI with SQLAlchemy ORM
- **Frontend**: React with TypeScript and Tailwind CSS
- **Database**: PostgreSQL
- **Container**: Docker and Docker Compose

## Features

- User authentication (register/login)
- Add, edit, delete expenses
- Categorize expenses
- View expense history
- Responsive web interface

## Quick Start with Docker

1. Clone the repository
2. Make sure Docker and Docker Compose are installed
3. Run the application:

```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (create `.env` file):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
SECRET_KEY=your-secret-key-here
```

5. Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Database Setup

1. Install PostgreSQL locally or use Docker:
```bash
docker run --name postgres-db -e POSTGRES_DB=expense_tracker -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

2. The database will be automatically initialized with the schema when the backend starts.

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/token` - Login and get access token
- `GET /api/expenses/` - Get user's expenses
- `POST /api/expenses/` - Create a new expense
- `PUT /api/expenses/{id}` - Update an expense
- `DELETE /api/expenses/{id}` - Delete an expense
- `GET /api/expenses/categories/` - Get expense categories

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key for authentication

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000)

## Project Structure

```
expense-tracker/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   ├── requirements.txt     # Python dependencies
│   └── routers/
│       ├── auth.py          # Authentication routes
│       ├── expenses.py      # Expense routes
│       └── users.py         # User routes
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── services/        # API services
│   ├── package.json         # Node.js dependencies
│   └── tailwind.config.js   # Tailwind CSS config
├── database/
│   └── init.sql             # Database initialization
├── docker-compose.yml       # Docker services
├── Dockerfile.backend       # Backend container
├── Dockerfile.frontend      # Frontend container
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request