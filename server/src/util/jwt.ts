import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = "137166021162-mp5r4oe8edrn94tlfrjglr66m7bib2m4.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// TODO: I DON'T KNOW IF THIS IS HOW IT WORKS! TO BE TESTED!
/**
 * Verifies that the JWT token is valid.
 * Currently only spits out an error message in console log for invalid Google ID tokens
 * @param token JWT token to be validated
 * @returns An object with attributes `googleID`, `fullName`, and `email`, extracted from the JWT
 */
export async function verify(token) {
    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch(error) {
        console.log('[ERROR;] JWT TOKEN INVALID!')
        console.log(error);
        return null;
    }
    

    const credentials = {
        'googleID': payload['sub'],
        'fullName': payload['name'],
        'email': payload['email']
    };
    // ^ This might be a mistake - this might just be validating the individual fields, rather than decoding the JWT
    // If it doesn't decode, then use: https://www.npmjs.com/package/jose
    return credentials;
}
  
  