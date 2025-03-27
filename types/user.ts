

/* 
    General info about user. 
*/
export interface User {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    email_verified: string,
    image: string,
    role: string,
    profile: Profile;
}

/* 
    Profile information including:
    ~ Favorite artists
    ~ Lists created
    ~ 
*/

export interface Profile {

}

/* 
    Account security information for authorization / authentication.
*/
export interface Account {
    user: User;
}