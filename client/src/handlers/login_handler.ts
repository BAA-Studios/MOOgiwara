// TDOO: Migrate consumption of JWT tokens to server
/**
 * Extracts the user's email address from a given JWT token
 * @param jwtToken JWT token received via GSI
 * @returns {string} email address encoded inside the JWT token
 */
export function extractEmailFromToken(jwtToken): string {
    // TODO: find out the type for token
    console.log(jwtToken);
    return ""
}

/**
 * Checks if a given email address is associated with any existing accounts
 * @param email A gmail address, used as unique identifier
 * @returns {boolean} True, if there is an existing account with this email address
 */
export function isExistingAccount(email: string): boolean {
    console.log(email);
    return false;
}

/**
 * Create a new account on the game server 
 * @param email A gmail address, used as unique identifier
 */
export function createNewAccount(email: string): void {
    console.log(email);
}

/**
 * Logs a user in on the client side.
 * This function first checks if there is an account already registered, if not, a new account is created.
 * Else, the existing user is logged in.
 * @param email A gmail address, used as unique identifier
 */
export function login(email: string): void {
    console.log(email);
}