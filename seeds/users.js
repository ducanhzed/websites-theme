const Users = require('../models/user')
const mongoose = require('mongoose');


mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.');
        const user = new Users({ name: 'admin', password: '123456', role: 'admin' });
        user.hashPassword();

        user.save(err => {
            if (err) console.log(err)
            else console.log(`${user.name} has been saved !`)
            mongoose.connection.close()})
    } else {
        console.log('Error in DB connection: ' + err)
    }
});
