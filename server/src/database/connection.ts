import { connect } from 'mongoose';

import { IPlayerData, PlayerData } from './player_data_model';

// Omitting users/authentication, authorisation/privileges setting for testbench:
const mongoDB = "mongodb://127.0.0.1:27017/moogiwara_test";
// const mongoDB = "mongodb://username:password@127.0.0.1:PORT/moogiwara_prod";

export async function connectToDB() {
    try {
        await connect(mongoDB);
    } catch (error) {
        console.log('[ERROR] UNABLE TO CONNECT TO DATABASE');
        console.error(error);
    }
}

export async function fetchPlayerDataByUuidString(uuid: string): Promise<IPlayerData | null> {
    return await PlayerData.findById(uuid).exec();
}

/**
 * Gets all registered accounts with matching email addresses.
 * Email addresses should technically be unique, but this uses `find` instead of `findOne` to allow searching for of duplicate entries.
 * @param email Gmail address that the user registered with
 * @returns Array of matching accounts
 */
export async function fetchPlayerDataArrayByEmail(email: string): Promise<Array<IPlayerData>> {
    return await PlayerData.find({ email: email }).exec();
}

export async function isRegisteredUser(email: string): Promise<boolean> {
    const result: Array<IPlayerData> = await fetchPlayerDataArrayByEmail(email);
    if (Array.isArray(result) && result.length > 0) {
        return true;
    }
    return false;
}

export async function fetchPlayerDataByEmail(email: string): Promise<IPlayerData | undefined> {
    return await (await PlayerData.find({ email: email })).at(0);
}