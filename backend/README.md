# Lost & Found Backend API

Node.js/Express backend with PostgreSQL database.

## Features

- JWT Authentication
- RESTful API
- PostgreSQL with raw SQL queries
- Socket.io for real-time messaging
- File upload support

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile/me` - Get current user profile
- `PUT /api/profile/me` - Update profile
- `GET /api/profile/:id` - Get user profile by ID

### Items
- `POST /api/items` - Create new item (lost/found)
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get single item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/user/my-items` - Get user's items

### Search
- `GET /api/search?q=query&status=lost&category=electronics` - Search items

### Custodians
- `GET /api/custodians` - Get all custodian locations
- `POST /api/custodians/dropoff` - Create drop-off request
- `POST /api/custodians/pickup` - Create pickup request
- `GET /api/custodians/dropoff/my-requests` - Get user's drop-off requests
- `GET /api/custodians/pickup/my-requests` - Get user's pickup requests

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId/:itemId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/notifications` - Get notifications
- `PUT /api/messages/notifications/:id/read` - Mark notification as read

### Admin (requires admin role)
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/items` - Get all items
- `DELETE /api/admin/items/:id` - Delete item
- `GET /api/admin/stats` - Get system statistics
- `POST /api/admin/custodians` - Create custodian
- `PUT /api/admin/custodians/:id` - Update custodian
- `DELETE /api/admin/custodians/:id` - Delete custodian

## Database Schema

See `database/init.sql` for complete schema.

Main tables:
- profiles
- items
- messages
- custodians
- dropoff_requests
- pickup_requests
- item_history
- notifications
