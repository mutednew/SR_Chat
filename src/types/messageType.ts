import { IUser } from "@/types/userType";

export interface IMessage {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    chatId: string;
    sender?: IUser;
}