"use client";

import { Empty } from "antd";

export default function ChatIndexPage() {
    return (
        <div className="flex justify-center items-center h-full bg-gray-50">
            <Empty description="Select a chat to start chatting" />
        </div>
    );
}