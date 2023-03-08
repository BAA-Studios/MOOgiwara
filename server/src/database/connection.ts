import mongoose from 'mongoose';

// Omitting users/authentication, authorisation/privileges setting for testbench:
const mongoDB = "mongodb://127.0.0.1:27017/moogiwara_test";
// const mongoDB = "mongodb://username:password@127.0.0.1:PORT/moogiwara_prod";

export default async function connectToDB() {
    try {
        await mongoose.connect(mongoDB);
    } catch (error) {
        console.log('[ERROR] UNABLE TO CONNECT TO DATABASE');
        console.error(error);
    }
}