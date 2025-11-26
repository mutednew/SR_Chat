"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/features/authSlice';
import { ApiErrorResponse, AuthResponse, LoginValues, RegisterValues } from "@/types/authType";

const { Title } = Typography;

type FormValues = LoginValues | RegisterValues;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleSubmit = async (values: FormValues, isRegister: boolean) => {
        setLoading(true);
        try {
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = (await res.json()) as AuthResponse | ApiErrorResponse;

            if (!res.ok) {
                const errorData = data as ApiErrorResponse;
                throw new Error(errorData.error || 'Something went wrong');
            }

            const successData = data as AuthResponse;

            dispatch(setCredentials({ user: successData.user, token: successData.token }));
            message.success(isRegister ? 'Registered successfully!' : 'Welcome back!');

            router.push('/');
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(error.message);
            } else {
                message.error('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <Card className="w-96 shadow-lg">
                <div className="text-center mb-6">
                    <Title level={3}>Next Chat</Title>
                </div>

                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            key: '1',
                            label: 'Login',
                            children: (
                                <Form
                                    // Явно указываем тип значений для onFinish
                                    onFinish={(vals: LoginValues) => handleSubmit(vals, false)}
                                    layout="vertical"
                                >
                                    <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                                        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                                    </Form.Item>
                                    <Form.Item name="password" rules={[{ required: true }]}>
                                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                                    </Form.Item>
                                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                                        Log in
                                    </Button>
                                </Form>
                            ),
                        },
                        {
                            key: '2',
                            label: 'Register',
                            children: (
                                <Form
                                    // Явно указываем тип значений для onFinish
                                    onFinish={(vals: RegisterValues) => handleSubmit(vals, true)}
                                    layout="vertical"
                                >
                                    <Form.Item name="name" rules={[{ required: true }]}>
                                        <Input prefix={<UserOutlined />} placeholder="Name" size="large" />
                                    </Form.Item>
                                    <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                                        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                                    </Form.Item>
                                    <Form.Item name="password" rules={[{ required: true }]}>
                                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                                    </Form.Item>
                                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                                        Sign Up
                                    </Button>
                                </Form>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
}