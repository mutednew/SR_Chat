import React, { memo } from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { IMessage } from "@/types/messageType";

interface MessageBubbleProps {
    msg: IMessage;
    isMe: boolean;
}

export const MessageBubble = memo(({ msg, isMe }: MessageBubbleProps) => {
    return (
        <div
            className={`flex w-full ${isMe ? "justify-end" : "justify-start items-end gap-3"}`}
        >
            {!isMe && (
                <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    src={msg.sender?.avatar}
                    className="flex-shrink-0 mb-1"
                />
            )}

            <div
                className={`
                  max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm
                  ${isMe
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}
                `}
            >
                <p className="m-0 break-words">{msg.content}</p>
                <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
            </div>
        </div>
    );
});