import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Incorrect email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
    email: z.string().email("Incorrect email format"),
    password: z.string().min(1, "Enter password"),
});

export const createChatSchema = z.object({
    email: z.string().email("Incorrect email format"),
});

export const sendMessageSchema = z.object({
    content: z.string().min(1, "The message cannot be empty."),
    chatId: z.string().min(1, "ID is required"),
});