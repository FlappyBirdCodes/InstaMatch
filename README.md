# InstaMatch 
This is a dating website made with expressJS and mongoDB. Users can make an account and randomly "match" with other users. Once they have "matched" with another user, they have the ability to message each other. The user can also delete a "match". 

# Password authentication 
Passwords are encrypted with bycrypt, a javascript library. When a user signs up for the service, their password will be encrypted and stored with a "salt" in the mongoDB database. When they are logging in with their pasword later on, their entered password will be compared with the encrypted password in the database. If the passwords match, the user will be allowed access into their account. 

# Randomized Matching 
When users want to "match", the backend system will query all users that the current user might be interested in. This takes into consideration many factors such as gender and age. A randomized "match" will be recommended and rendered onto the client side. The user can now "match" with the user or they can choose to find another user. 

# Messaging 
Messaging in this app was done with mongoDB. Messages and their information are stored in a database when they are submitted. They are recovered and updated whenever necessary, such as when a user submits a new message.

# Skills
Implementing many different features, such as randomized matching, messaging and password authentication, requires an understanding of expresJS and proefficiency in javascript. While building this app, I had to use complex javascript features such as promises and async-await. I also had to use express features such as middleware functions to attach information and sessions to send data across different routes. 
