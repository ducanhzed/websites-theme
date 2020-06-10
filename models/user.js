const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});

user.methods.hashPassword = function (password) {
    return bcrypt.hashSync(password, 10);
}

user.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('users', user);