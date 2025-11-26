"use client";
import { Modal, Input } from "antd";

interface Props {
    open: boolean;
    onCancel: () => void;
    onOk: () => void;
    confirmLoading: boolean;
    email: string;
    setEmail: (val: string) => void;
}

export default function CreateChatModal({ open, onCancel, onOk, confirmLoading, email, setEmail }: Props) {
    return (
        <Modal
            title="New chat"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            confirmLoading={confirmLoading}
        >
            <Input
                placeholder="Enter Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
        </Modal>
    );
}