require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 10 })
.then(async () => {
  const faculties = [
    { name: "Preeti Hemnani",      title: "Dr.",  gender: "Female" },
    { name: "Swati Rane",          title: "Dr.",  gender: "Female" },
    { name: "Biju Balkrishnan",    title: "Prof.", gender: "Male"  },
    { name: "Shyamala Mathi",      title: "Prof.", gender: "Female" },
    { name: "Priyanka Kadam",      title: "Prof.", gender: "Female" },
    { name: "Sonal Hutke",         title: "Dr.",  gender: "Female" },
    { name: "Vaishali Mangrulkar", title: "Prof.", gender: "Female" },
    { name: "Vandana Sawant",      title: "Prof.", gender: "Female" },
    { name: "Pratibha Joshi",      title: "Prof.", gender: "Female" },
    { name: "Pranavi Nikam",       title: "Prof.", gender: "Female" }
  ];

  await Faculty.deleteMany({}); // Drop faculty collection to reset
  await User.deleteMany({ role: "teacher" });

  for (let f of faculties) {
    const createdFac = await Faculty.create(f);
    
    // Generate email pattern: firstname + initial of lastname + extc@sies.edu.in
    const names = f.name.toLowerCase().split(' ');
    const username = names[0] + (names.length > 1 ? names[1].charAt(0) : "");
    const email = `${username}extc@gst.sies.edu.in`;
    const password = `${username}extc`;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'teacher',
      faculty: createdFac._id
    });
    
    console.log(`Created teacher: ${f.title} ${f.name} | ${email} | ${password}`);
  }
  
  console.log("Teacher setup complete.");
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
