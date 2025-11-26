import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, type InputRef } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface MessageInputProps {
    onSend: (text: string) => void;
    isLoading?: boolean;
}

export const MessageInput = ({ onSend, isLoading }: MessageInputProps) => {
    const [text, setText] = useState('');

    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    }, [isLoading]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');

        inputRef.current?.focus();
    };

    return (
        <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    size="large"
                    placeholder="Напишите сообщение..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onPressEnter={handleSend}
                    className="rounded-full"
                />
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    className="flex-shrink-0 bg-blue-600"
                    loading={isLoading}
                />
            </div>
        </div>
    );
};