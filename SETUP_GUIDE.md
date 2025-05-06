# Setup Guide for Water Leakage Detection System

## Detailed Installation Steps

### 1. System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 20.x or later
- **PostgreSQL**: Version 14.x or later
- **Memory**: At least 2GB RAM
- **Disk Space**: At least 500MB free space

### 2. PostgreSQL Database Setup

#### On Linux/macOS:

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Create database and user
sudo -u postgres psql
```

In the PostgreSQL prompt:

```sql
CREATE DATABASE water_leak_db;
CREATE USER leak_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE water_leak_db TO leak_user;
\q
```

#### On Windows:

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. During installation, set a password for the postgres user
3. Use pgAdmin 4 (included in the installation) to create a new database called `water_leak_db`

### 3. Application Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/water-leakage-detection-system.git
cd water-leakage-detection-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
DATABASE_URL=postgresql://leak_user:your_password@localhost:5432/water_leak_db
SESSION_SECRET=random_string_here_at_least_32_chars
```

4. Initialize the database schema and seed data:
```bash
npm run db:push
npm run db:seed
```

5. Start the application:
```bash
npm run dev
```

6. Access the application at `http://localhost:5000`

### 4. Troubleshooting Common Issues

#### Database Connection Issues

- Verify PostgreSQL is running with `sudo service postgresql status` (Linux/macOS) or through Services (Windows)
- Check that the DATABASE_URL in your .env file is correct
- Ensure the database user has proper permissions

#### Server Startup Problems

- Port 5000 might be in use. Change the port in `server/index.ts` if needed
- Check the server logs for specific error messages

#### Data Not Displaying

- Verify the database has been seeded correctly with `npm run db:seed`
- Check browser console for WebSocket connection errors

### 5. Production Deployment Considerations

#### Security

- Use a strong SESSION_SECRET
- Set up SSL/TLS for secure connections
- Implement rate limiting and CORS protection

#### Performance

- Consider using a connection pool for database connections
- Add caching for frequently accessed data
- Use a process manager like PM2 to keep the application running

#### Deployment

- Use a process manager like PM2 or systemd to keep the application running
- Consider using Docker for containerized deployment
- Set up monitoring with tools like Prometheus/Grafana

```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start "npm run start" --name water-leak-system

# Set up PM2 to start on system boot
pm2 startup
```

## Contact

For further assistance, please open an issue on the GitHub repository or contact the maintainer at [your_email@example.com].
