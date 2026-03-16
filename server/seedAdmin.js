const bcrypt = require("bcrypt");
const Admin = require("./models/AdminUser");

async function seedAdmin() {
  try {
    const admin = await Admin.findOne();

    if (!admin) {
      const hash = await bcrypt.hash("1111", 10);

      await Admin.create({
        email: "admin@gmail.com",
        password: hash
      });

      console.log("Admin seeded");
    } else {
      console.log("Admin already exists");
    }

    process.exit();
  } catch (err) {
    console.error(err);
  }
}

seedAdmin();