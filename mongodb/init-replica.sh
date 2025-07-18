#!/bin/bash

# Wait for MongoDB to start
sleep 10

# Initialize replica set
mongosh --host mongodb:27017 --username admin --password password --authenticationDatabase admin --eval "
try {
  rs.status()
  print('Replica set already initialized')
} catch (e) {
  print('Initializing replica set...')
  rs.initiate({
    _id: 'rs0',
    members: [
      { _id: 0, host: 'mongodb:27017' }
    ]
  })
  print('Replica set initialized')
}
"
