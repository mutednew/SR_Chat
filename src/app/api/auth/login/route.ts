import { NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { loginSchema } from "@/lib/validators";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { email, password } = loginSchema.parse(body);

        const data = await authService.login(email, password);

        return NextResponse.json(data);
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
        }

        const status = err.message === "User already exists" ? 400 : 500;

        return NextResponse.json({ error: err.message }, { status });
    }
}