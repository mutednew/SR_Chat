interface RegisterFormValues {
    email: string;
    password: string;
    name: string;
}

interface LoginFormValues extends Pick<RegisterFormValues, 'email' | 'password'> {}

interface AuthResponseData {
    user: { id: string; name: string; email: string };
    token: string;
}

interface ErrorResponse {
    error: string;
}