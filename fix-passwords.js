const bcrypt = require("bcrypt");

async function generateHash() {
  try {
    const hash = await bcrypt.hash("admin123", 10);
    console.log("Generated hash for admin123:");
    console.log(hash);
    console.log("\nUpdate commands:");
    console.log(
      `docker compose exec mongodb mongosh --username admin --password password --authenticationDatabase admin flowbitai --eval 'db.User.updateOne({email: "admin@logisticsco.com"}, {\\$set: {password: "${hash}"}})'`
    );
    console.log(
      `docker compose exec mongodb mongosh --username admin --password password --authenticationDatabase admin flowbitai --eval 'db.User.updateOne({email: "admin@retailgmbh.com"}, {\\$set: {password: "${hash}"}})'`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

generateHash();
