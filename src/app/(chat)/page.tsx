'use client';

import { Empty } from 'antd';

export default function ChatIndexPage() {
    return (
        <div className="flex justify-center items-center h-full bg-gray-50">
            <Empty description="Выберите чат, чтобы начать общение" />
        </div>
    );
}