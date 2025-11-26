import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET;

export const generateToken = (userId: string): string => {
    if (!SECRET_KEY) throw new Error("JWT_SECRET missing");
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "7d" });
};

export const getUserIdFromHeader =  async () => {
    if (!SECRET_KEY) throw new Error("JWT_SECRET missing");

    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error("Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        return decoded.userId;
    } catch (err) {
        throw new Error("Unauthorized: Invalid token");
    }
};