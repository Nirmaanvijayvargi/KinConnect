import { ConfigProvider, App } from 'antd';

const ThemeConfig = ({ children }) => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#D32F2F', // Crimson Red
                    borderRadius: 16,       // Large border radius for accessibility
                    fontSize: 16,
                    wireframe: false,
                },
                components: {
                    Button: {
                        algorithm: true, // Enable algorithm for Button
                    },
                }
            }}
        >
            <App>
                {children}
            </App>
        </ConfigProvider>
    );
};

export default ThemeConfig;
