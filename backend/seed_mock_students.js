require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Faculty = require('./models/Faculty');
const QuizResult = require('./models/QuizResult');
const ModuleSession = require('./models/ModuleSession');
const bcrypt = require('bcryptjs');

async function seedMockData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for mock seeding...");

    // Clean up previous mock data
    await User.deleteMany({ isMock: true });
    await Project.deleteMany({ isMock: true });
    await QuizResult.deleteMany({ isMock: true });
    await ModuleSession.deleteMany({ isMock: true });
    console.log("Cleaned up old mock data.");

    const faculties = await Faculty.find({});
    if (faculties.length === 0) {
      console.log("No faculty found. Run setup_teachers.js first.");
      process.exit(1);
    }

    const topics = ["Arduino Basics", "LED Blinking", "Sensor Integration", "LCD Display", "Serial Monitor"];
    const statuses = ["planning", "in-progress", "review", "completed"];

    for (let faculty of faculties) {
      // Create 2 mock students for each faculty
      for (let i = 1; i <= 2; i++) {
        const studentName = `student_${faculty.name.split(' ')[0].toLowerCase()}_${i}`;
        const email = `${studentName}@mock.edu`;
        const password = await bcrypt.hash("password123", 10);

        const student = await User.create({
          username: studentName,
          email,
          password,
          role: 'student',
          isMock: true
        });

        // Create a project for the student
        const project = await Project.create({
          student: student._id,
          title: `${studentName}'s Project`,
          description: `Description for ${studentName}'s project.`,
          topic: topics[Math.floor(Math.random() * topics.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          guide: faculty._id,
          isMock: true
        });

        // Create 1-3 mock quiz results for the student
        const quizCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < quizCount; j++) {
          const score = Math.floor(Math.random() * 6) + 5; // 5-10
          const total = 10;
          await QuizResult.create({
            student: student._id,
            topic: topics[j % topics.length],
            score,
            totalQuestions: total,
            percentage: (score / total) * 100,
            tabSwitchCount: Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0,
            answers: [],
            isMock: true
          });
        }

        // Create 2-4 mock module sessions for the student
        const sessionCount = Math.floor(Math.random() * 3) + 2;
        for (let k = 0; k < sessionCount; k++) {
          await ModuleSession.create({
            student: student._id,
            module: "Foundations of Electronics",
            topic: topics[k % topics.length],
            durationSeconds: Math.floor(Math.random() * 600) + 60, // 1 to 11 minutes
            isMock: true
          });
        }
      }
      console.log(`Seeded 2 mock students for faculty: ${faculty.name}`);
    }

    console.log("Mock data seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding mock data:", error);
    process.exit(1);
  }
}

seedMockData();
