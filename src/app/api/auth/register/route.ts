import { NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { registerSchema } from "@/lib/validators";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { email, password, name } = registerSchema.parse(body);

        const data = await authService.register(email, password, name);

        return NextResponse.json(data);
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
        }

        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}