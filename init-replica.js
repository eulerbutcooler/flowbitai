// MongoDB shell script - 'rs' is a MongoDB shell global
// Initialize MongoDB replica set
rs.initiate({
  _id: "rs0",
  members: [
    {
      _id: 0,
      host: "localhost:27017",
    },
  ],
});
