const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('Uncaught Exception 💥 shutting down....');
  console.log(err.name, err.message);
  process.exit(1)

});

dotenv.config({ path: './config.env' });
const app = require('./app');
// console.log(process.env);

const db = process.env.LOCAL_DATABASE;

mongoose.connect(db, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => {
  console.log("DB connected Successfully");
})

const port = process.env.PORT || 8088;
app.listen(port, () => {
  console.log(`App running on Port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});