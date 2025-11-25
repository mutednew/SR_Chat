import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <AntdRegistry>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: "#1677ff"
                        }
                    }}
                >
                    {children}
                </ConfigProvider>
            </AntdRegistry>
        </Provider>
    );
}