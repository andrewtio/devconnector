const mongoose = require('mongoose');
// used to connect to mongoose

const config = require('config');
// to grab tha tstring we put in package json

const db = config.get('mongoURI');
// to get value mongoURI in config

const connectDB = async () => {
  try {
    // await digunakan karena mongoose me return sebuah promise
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true
      // this is to remove the DepreciationWarning when run the server
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failur
    process.exit(1);
  }
  // try adalah mekanisme jika try gagal makan kode akan berjalan ke catch(err)
};

module.exports = connectDB;
