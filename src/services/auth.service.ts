import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

export const authService = {
    async register(email: string, password: string, name: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
            }
        });

        const token = generateToken(user.id);

        return { user, token };
    },

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Invalid credentials");
        }

        const token = generateToken(user.id);

        return { user, token };
    }
};