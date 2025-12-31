# Installing MultiChat on Termux

This guide will help you install and run MultiChat on your Android device using Termux.

## ⚠️ Important Limitation

**Building MultiChat directly on Termux is currently not possible** due to native dependencies (lightningcss) that don't support Android ARM64 architecture.

### Recommended Solutions:

**Option 1: Use Pre-built Version (Easiest)**
- Have someone build MultiChat on a PC/Mac/Linux machine
- Transfer the `dist` folder to your Termux device
- Run the pre-built version (see instructions below)

**Option 2: Access MultiChat via Web (Recommended for Mobile)**
- Deploy MultiChat to a server (Vercel, Railway, etc.)
- Install as PWA on your phone (see [MOBILE_INSTALL.md](./MOBILE_INSTALL.md))
- This is the best mobile experience!

**Option 3: Build on Another Machine, Run on Termux**
- Build on a computer with `npm run build`
- Copy the entire project to Termux
- Run the pre-built version

## Running Pre-built MultiChat on Termux

If you have a pre-built version, follow these steps:

### Prerequisites

Before starting, make sure you have:
- Termux app installed from [F-Droid](https://f-droid.org/packages/com.termux/) (not Google Play, as that version is outdated)
- At least 2GB of free storage space
- Stable internet connection

## Step 1: Update Termux and Install Dependencies

```bash
# Update package lists and upgrade existing packages
pkg update && pkg upgrade -y

# Install required packages
pkg install -y nodejs git mysql
```

## Step 2: Install pnpm

MultiChat uses pnpm as its package manager:

```bash
# Install pnpm globally
npm install -g pnpm
```

## Step 3: Clone the Repository

```bash
# Navigate to your preferred directory
cd ~/

# Clone the MultiChat repository
git clone https://github.com/YOUR_USERNAME/MultiChat.git
cd MultiChat
```

## Step 4: Set Up MySQL Database

### Start MySQL Server

```bash
# Initialize MySQL data directory (first time only)
mysql_install_db

# Start MySQL server
mysqld &

# Wait a few seconds for MySQL to start
sleep 5
```

### Create Database

```bash
# Connect to MySQL (press Enter when prompted for password)
mysql -u root

# In the MySQL prompt, run:
# CREATE DATABASE multichat;
# exit;
```

Or run this one-liner:

```bash
mysql -u root -e "CREATE DATABASE multichat;"
```

## Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
# Required Configuration
DATABASE_URL=mysql://root@localhost:3306/multichat
JWT_SECRET=your-secret-key-change-this-to-something-random
VITE_APP_ID=multichat-termux
NODE_ENV=development

# Optional Configuration (uncomment and configure if needed)
# OAUTH_SERVER_URL=
# OWNER_OPEN_ID=
# BUILT_IN_FORGE_API_URL=
# BUILT_IN_FORGE_API_KEY=
EOF
```

**Important**: Change `your-secret-key-change-this-to-something-random` to a secure random string.

To generate a secure JWT secret, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Get Pre-built Files

Since you can't build on Termux, you need the pre-built `dist` folder. Either:

**Method A: Transfer from your computer**
```bash
# On your computer, build the project
npm run build

# Then use one of these methods to transfer:
# 1. Use termux-setup-storage and copy via file manager
# 2. Use scp/rsync to transfer files
# 3. Upload to cloud storage and download in Termux
```

**Method B: Clone with pre-built files**
```bash
# If the repository already has dist folder committed
git clone https://github.com/YOUR_USERNAME/MultiChat.git
cd MultiChat
```

## Step 7: Install Production Dependencies Only

```bash
# Install only production dependencies (no build tools needed)
pnpm install --prod
```

## Step 8: Set Up Database Schema

You need the dev dependencies for this one-time setup:

```bash
# Temporarily install dev dependencies for database setup
pnpm install drizzle-kit

# Run database migrations
pnpm db:push

# Optional: Remove dev dependencies to save space
pnpm prune --prod
```

## Step 9: Run MultiChat

### For Development (with hot reload):

```bash
pnpm dev
```

### For Production:

```bash
pnpm start
```

## Step 10: Access the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:5000
```

You should see the MultiChat interface!

## Troubleshooting

### Build Error: "Cannot find module '../lightningcss.android-arm64.node'"

This error occurs because Tailwind CSS v4 uses native binaries that aren't available for Android ARM64.

**Solution**: You cannot build on Termux. Use one of these alternatives:
1. Build on a PC/Mac/Linux machine and transfer the `dist` folder
2. Deploy MultiChat to a server and use the PWA (see [MOBILE_INSTALL.md](./MOBILE_INSTALL.md))
3. Use a pre-built version from your repository

### MySQL Won't Start

If MySQL fails to start:

```bash
# Kill any existing MySQL processes
pkill -9 mysql

# Remove any lock files
rm -f ~/usr/var/run/mysqld/mysqld.pid

# Try starting again
mysqld &
```

### Port Already in Use

If port 5000 is already in use, you can change it by modifying the server configuration or finding and killing the process using that port:

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

### Permission Errors

If you encounter permission errors:

```bash
# Fix permissions for node_modules
chmod -R 755 node_modules

# Or reinstall dependencies
rm -rf node_modules
pnpm install
```

## Keeping MultiChat Running in Background

To keep MultiChat running even when you close Termux:

### Using nohup:

```bash
nohup pnpm start > multichat.log 2>&1 &
```

### Using Termux:Boot (Recommended)

1. Install Termux:Boot from F-Droid
2. Create a startup script:

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/multichat.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Start MySQL
mysqld &
sleep 5

# Start MultiChat
cd ~/MultiChat
pnpm start &
EOF

chmod +x ~/.termux/boot/multichat.sh
```

## Updating MultiChat

To update to the latest version:

```bash
cd ~/MultiChat

# Stop the server (Ctrl+C if running in foreground)

# Pull latest changes
git pull

# Update dependencies
pnpm install

# Rebuild
pnpm build

# Restart
pnpm start
```

## Performance Tips

1. **Close unnecessary apps** - Free up RAM for better performance
2. **Use production mode** - `pnpm start` is faster than `pnpm dev`
3. **Keep Termux acquired wakelock** - Settings → Acquire wakelock in Termux
4. **Disable battery optimization** - For Termux in Android settings

## Additional Notes

- The first build may take 10-15 minutes on slower devices
- MySQL service needs to be running before starting MultiChat
- Check `multichat.log` for any error messages if using background mode
- For external access, you may need to configure port forwarding or use a reverse proxy

## Getting Help

If you encounter issues:
1. Check the error logs
2. Verify all environment variables are set correctly
3. Ensure MySQL is running: `pgrep mysql`
4. Check available storage: `df -h`
5. Review the main project documentation

## Resources

- [Termux Wiki](https://wiki.termux.com/)
- [MultiChat Documentation](./docs/)
- [pnpm Documentation](https://pnpm.io/)
