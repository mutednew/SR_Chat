"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Tabs, App } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/features/authSlice";

const { Title } = Typography;

interface RegisterFormValues {
    email: string;
    password: string;
    name: string;
}
type FormValues = RegisterFormValues | LoginFormValues;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { message: messageApi } = App.useApp();

    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();

    const handleSubmit = async (values: FormValues, isRegister: boolean) => {
        setLoading(true);
        isRegister ? registerForm.setFields([]) : loginForm.setFields([]);

        try {
            const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Something went wrong");

            dispatch(setCredentials({ user: data.user, token: data.token }));

            messageApi.success(isRegister ? "Registered successfully!" : 'Welcome back!');

            router.push("/");
        } catch (error: any) {
            messageApi.error(error.message);
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
                    defaultActiveKey="2"
                    items={[
                        {
                            key: "1",
                            label: "Login",
                            children: (
                                <Form
                                    form={loginForm}
                                    onFinish={(vals) => handleSubmit(vals, false)}
                                    layout="vertical"
                                >
                                    <Form.Item name="email" rules={[{ required: true, type: "email", message: "Enter email!" }]}>
                                        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                                    </Form.Item>
                                    <Form.Item name="password" rules={[{ required: true, message: "Enter password!" }]}>
                                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                                    </Form.Item>
                                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                                        Log in
                                    </Button>
                                </Form>
                            ),
                        },
                        {
                            key: "2",
                            label: "Register",
                            children: (
                                <Form
                                    form={registerForm}
                                    onFinish={(vals) => handleSubmit(vals, true)}
                                    layout="vertical"
                                >
                                    <Form.Item name="name" rules={[{ required: true, message: "Enter name!" }]}>
                                        <Input prefix={<UserOutlined />} placeholder="Name" size="large" />
                                    </Form.Item>
                                    <Form.Item name="email" rules={[{ required: true, type: "email", message: "Enter email!" }]}>
                                        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                                    </Form.Item>
                                    <Form.Item name="password" rules={[{ required: true, message: "Enter password!" }]}>
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