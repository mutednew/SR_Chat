import { IUser } from "@/types/userType";
import { IMessage } from "@/types/messageType";

export interface IChat {
    id: string;
    name?: string;
    users: IUser[];
    messages: IMessage[];
    updatedAt: string;
}