# Lost & Found Application

A full-stack Lost & Found application with React frontend and Node.js/Express backend, containerized with Docker.

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS 4
- Flowbite (component library)
- React Router
- Axios
- Socket.io Client

### Backend
- Node.js
- Express.js
- PostgreSQL (raw SQL queries, no ORM)
- JWT Authentication
- Socket.io (for real-time chat)
- bcryptjs

### Infrastructure
- Docker & Docker Compose
- PostgreSQL Database

## Features

- User authentication (register/login)
- Report lost items
- Report found items
- Search and filter items
- Real-time messaging (to be implemented)
- Custodian drop-off/pickup locations
- Admin panel
- Item history tracking
- Notifications

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### Running with Docker

1. Clone the repository
```bash
cd lost-and-found
```

2. Start all services
```bash
docker-compose up --build
```

3. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database: localhost:5432

4. Stop services
```bash
docker-compose down
```

### Default Admin Account
- Email: `admin@lostandfound.com`
- Password: `admin123`

### Local Development

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
lost-and-found/
├── backend/
│   ├── config/          # Database configuration
│   ├── database/        # SQL schema and migrations
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API routes
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities (API client)
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── docker-compose.yml
```

## API Documentation

See `backend/README.md` for detailed API documentation.

## Database Schema

The application uses PostgreSQL with the following main tables:
- `profiles` - User accounts
- `items` - Lost and found items
- `messages` - User messages
- `custodians` - Drop-off locations
- `dropoff_requests` - Item drop-off requests
- `pickup_requests` - Item pickup requests
- `item_history` - Item lifecycle tracking
- `notifications` - User notifications

## Design

- Light theme with white background
- Black and white button colors
- Clean, modern UI with Flowbite components
- Responsive design

## Next Steps

1. Implement remaining frontend pages (Items, Search, Profile, etc.)
2. Add image upload functionality
3. Implement real-time chat with Socket.io
4. Add email notifications
5. Implement admin dashboard
6. Add tests

## License

MIT
