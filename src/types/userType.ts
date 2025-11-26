export interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export type PublicUser = Omit<IUser, 'password'>;