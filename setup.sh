#!/bin/bash

echo "🚀 Setup Ekskul Presensi App"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak terinstall. Install Node.js terlebih dahulu."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL tidak terdeteksi. Pastikan PostgreSQL sudah terinstall."
else
    echo "✅ PostgreSQL terdeteksi"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo ""

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  PENTING: Edit file .env dan sesuaikan dengan konfigurasi database Anda!"
    echo ""
else
    echo "✅ .env file sudah ada"
    echo ""
fi

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p public/uploads/templates
echo "✅ Upload directories created"
echo ""

# Generate NextAuth secret
echo "🔐 Generating NextAuth secret..."
SECRET=$(openssl rand -base64 32)
echo "Copy secret ini ke .env:"
echo "NEXTAUTH_SECRET=\"$SECRET\""
echo ""

echo "✅ Setup selesai!"
echo ""
echo "📋 Langkah selanjutnya:"
echo "1. Edit file .env dan sesuaikan DATABASE_URL"
echo "2. Buat database: createdb ekskul_db"
echo "3. Run migrations: npx prisma migrate dev"
echo "4. Seed data (opsional): npx prisma db seed"
echo "5. Start development: npm run dev"
echo ""
echo "🎉 Happy coding!"
