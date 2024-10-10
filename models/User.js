const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true},
    email: { type: String, required: true },
    password: { type: String, required: true }
  
      
    },
    
  );

  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
  
  const User = mongoose.model('User', userSchema);

module.exports = User;
