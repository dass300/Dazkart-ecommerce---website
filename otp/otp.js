const express = require('express')
// const client = require('twilio')(accountSid, authToken);
const app = express()

const accountSid = 'ACfedc8fa3b05bdd9560e1c41bf1bba388'; 
const authToken = '[AuthToken]'; 
const client = require('twilio')(accountSid, authToken); 
 
// client.messages 
//       .create({ 
//          body: 'your Das-ecomm OTP is 5268',        
//          to: '+918921653181' 
//        }) 
//       .then(message => console.log(message.sid)) 
//       .done();

      client.messages.create({
        body: 'Your Das-ecomm OTP is 5268',
        to: '+15099062199',
        from: '+18508135123'
     }).then(message => console.log('Your Das-ecomm OTP is 5268'))
       // here you can implement your fallback code
       .catch(error => console.log(error))
