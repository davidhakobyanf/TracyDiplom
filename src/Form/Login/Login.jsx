import React, { useReducer, useEffect } from 'react';
import css from "./Login.module.css";
import { Button, Form, Input, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const initialState = {
    loading: false,
    error: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'REQUEST_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return { ...state, loading: false, error: null };
        case 'LOGIN_ERROR':
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
};

const Login = ({ form, setCheck }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [cookies, setCookie] = useCookies(['UserId', 'IsAdmin']);
    const navigate = useNavigate();

    const showLoginError = (errorMsg) => {
        message.destroy();
        message.error(errorMsg, 2);
    };

    const handleLogin = async (values) => {
        dispatch({ type: 'REQUEST_START' });
        message.loading({ content: 'Logging in...', key: 'login', duration: 0 });

        try {
            // 1. Проверка администратора
            const adminData = JSON.parse(localStorage.getItem('admin'));
            if (adminData?.name === values.name && adminData?.password === values.password) {
                localStorage.setItem('Name', adminData.name);
                localStorage.setItem('currentUser', JSON.stringify(adminData));
                localStorage.setItem('UserId', 'admin');
                setCookie('UserId', 'admin', { path: '/' });
                setCookie('IsAdmin', 'true', { path: '/' });

                message.destroy();
                navigate('/healthhybite/admin');
                return;
            }

            // 2. Проверка обычных пользователей
            const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
            const user = storedUsers.find(u =>
                u.name === values.name &&
                u.password === values.password
            );

            if (user) {
                localStorage.setItem('Name', user.name);
                localStorage.setItem('currentUser', JSON.stringify(user.userData));
                localStorage.setItem('UserId', user.id);
                setCookie('UserId', user.id, { path: '/' });
                setCookie('IsAdmin', 'false', { path: '/' });

                message.destroy();
                navigate('/healthhybite/profile');
            } else {
                throw new Error('Invalid username or password');
            }
        } catch (error) {
            showLoginError(error.message);
            dispatch({ type: 'LOGIN_ERROR', error: error.message });
        }
    };

    return (
        <div className={css.right}>
            <h2 className={css.title}>Login</h2>
            <Form form={form} onFinish={handleLogin} className={css.form}>
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                >
                    <Input placeholder="Name" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password
                        placeholder="Enter your password"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={state.loading}>
                    Login
                </Button>
                <p>Do not have an account? <a onClick={() => setCheck(true)} style={{cursor:"pointer"}}>Register</a></p>
            </Form>
        </div>
    );
};

export default Login;