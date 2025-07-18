#!/bin/bash

echo "Seeding FlowBit.ai with LogisticsCo and RetailGmbH tenants"
echo "========================================================"

# Check if MongoDB is accessible
echo "Checking MongoDB connection..."
docker compose exec mongodb mongosh --username admin --password password --authenticationDatabase admin --eval "db.adminCommand('ismaster')" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "MongoDB is not accessible. Make sure docker-compose is running."
    exit 1
fi

echo "MongoDB is accessible"

# Create users directly in MongoDB
echo ""
echo "Creating admin users..."

# LogisticsCo admin
echo "Creating LogisticsCo admin..."
docker compose exec mongodb mongosh --username admin --password password --authenticationDatabase admin flowbitai --eval '
const email = "admin@logisticsco.com";
const existingUser = db.User.findOne({ email: email });
if (!existingUser) {
    db.User.insertOne({
        email: email,
        password: "$2b$10$QhJDRet.awwK0fS699jh6.NK87dt59yKSfMz/QuQoLuy7aadrDPR6", // admin123
        role: "ADMIN",
        customerId: "logisticsco",
        createdAt: new Date(),
        updatedAt: new Date()
    });
    print("Created LogisticsCo admin");
} else {
    print("LogisticsCo admin already exists");
}'

# RetailGmbH admin  
echo "Creating RetailGmbH admin..."
docker compose exec mongodb mongosh --username admin --password password --authenticationDatabase admin flowbitai --eval '
const email = "admin@retailgmbh.com";
const existingUser = db.User.findOne({ email: email });
if (!existingUser) {
    db.User.insertOne({
        email: email,
        password: "$2b$10$QhJDRet.awwK0fS699jh6.NK87dt59yKSfMz/QuQoLuy7aadrDPR6", // admin123
        role: "ADMIN", 
        customerId: "retailgmbh",
        createdAt: new Date(),
        updatedAt: new Date()
    });
    print("Created RetailGmbH admin");
} else {
    print("RetailGmbH admin already exists");
}'

echo ""
echo "Seeding completed!"
echo ""
echo "You can now login with:"
echo "  LogisticsCo: admin@logisticsco.com / admin123"
echo "  RetailGmbH:  admin@retailgmbh.com / admin123"
