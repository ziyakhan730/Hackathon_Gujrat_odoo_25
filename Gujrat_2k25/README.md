# QuickCourt - Sports Court Booking Platform

A modern sports court booking platform built with React, TypeScript, Django, and JWT authentication.

## Features

- **User Authentication**: JWT-based login/signup with email and phone verification
- **User Types**: Support for both Players and Court Owners
- **Country Code Support**: International phone number validation with country codes
- **Modern UI**: Glassmorphism design with dark/light theme support
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Validation**: Form validation with instant feedback

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Sonner for toast notifications
- Shadcn/ui components

### Backend
- Django 4.2
- Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- Phone number validation (django-phonenumber-field)
- CORS support for frontend integration

## Project Structure

```
Gujrat_2k25/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── ...
│   └── package.json
├── backend/                  # Django backend application
│   ├── authentication/      # User authentication app
│   ├── backend/            # Django project settings
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- Git

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Populate country codes**:
   ```bash
   python manage.py populate_country_codes
   ```

7. **Create superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

8. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The frontend will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password

### Country Codes
- `GET /api/auth/country-codes/` - Get list of country codes

### Validation
- `GET /api/auth/check-email/` - Check if email exists
- `GET /api/auth/check-phone/` - Check if phone number exists

## User Types

### Player
- Can book courts
- Join matches
- View available facilities

### Court Owner
- Can list their courts
- Manage bookings
- View analytics

## Phone Number Validation

The system validates phone numbers based on country codes:
- India (+91): 10 digits
- US/Canada (+1): 10 digits
- UK (+44): 10 digits
- And many more countries...

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Development

### Backend Development
- The Django admin interface is available at `http://localhost:8000/admin/`
- API documentation can be viewed at `http://localhost:8000/api/`

### Frontend Development
- Hot reload is enabled for development
- TypeScript strict mode is enabled
- ESLint and Prettier are configured

## Deployment

### Backend Deployment
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up static files serving
4. Configure CORS for production domain

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@quickcourt.com or create an issue in the repository. 