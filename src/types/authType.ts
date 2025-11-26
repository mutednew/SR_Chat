import { PublicUser } from "@/types/userType";

export interface LoginValues {
    email: string;
    password: string;
}

export interface RegisterValues {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: PublicUser;
    token: string;
}

export interface ApiErrorResponse {
    error: string;
}