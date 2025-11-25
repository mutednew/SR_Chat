import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
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

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        return NextResponse.json({ user, token });
    } catch (e) {
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
    }
}