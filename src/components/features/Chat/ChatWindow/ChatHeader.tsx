import React from 'react';
import { Avatar, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface ChatHeaderProps {
    name?: string;
    avatar?: string;
    isOnline: boolean;
}

export const ChatHeader = ({ name, avatar, isOnline }: ChatHeaderProps) => {
    return (
        <div className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm z-10 gap-3">
            <Badge dot color={isOnline ? "green" : "gray"} offset={[-6, 32]}>
                <Avatar
                    src={avatar}
                    icon={<UserOutlined />}
                    className="bg-blue-500"
                    size="large"
                />
            </Badge>
            <div>
                <h3 className="font-bold text-gray-800 m-0 text-base">
                    {name || "Unknown User"}
                </h3>
                <span className={`text-xs ${isOnline ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
            </div>
        </div>
    );
};