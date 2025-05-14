import React, { useReducer, useEffect } from 'react';
import css from "./Registration.module.css";
import { Button, Form, Input, Select, DatePicker, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import dayjs from "dayjs";

const { Option } = Select;

const initialState = {
    loading: false,
    success: false,
    error: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'REQUEST_START':
            return { ...state, loading: true, error: null };
        case 'REQUEST_SUCCESS':
            return { ...state, loading: false, success: true, error: null };
        case 'REQUEST_ERROR':
            return { ...state, loading: false, success: false, error: action.error };
        default:
            return state;
    }
};

const Registration = ({ form, setCheck }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [cookies, setCookie] = useCookies(['UserId']);
    const navigate = useNavigate();

    useEffect(() => {
        if (state.loading) {
            message.loading({ content: 'Registering...', key: 'register' });
        }
        if (state.success) {
            message.success({ content: 'Registration was successful', key: 'register', duration: 2 });
            navigate('/healthhybite/profile');
        }
        if (state.error) {
            message.error({ content: state.error, key: 'register', duration: 2 });
        }
    }, [state.loading, state.success, state.error, navigate]);

    const createDietRecord = async (userId) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const dietRequest = {
                userId: userId,
                date: today
            };

            message.loading({ content: 'Creating diet record...', key: 'diet', duration: 0 });

            const response = await fetch('/api/diets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dietRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to create diet record');
            }

            const dietData = await response.json();
            message.success({ content: 'Diet record created', key: 'diet', duration: 2 });
            return dietData;
        } catch (error) {
            message.error({ content: error.message, key: 'diet', duration: 2 });
            throw error;
        }
    };

    const handleRegister = async (values) => {
        dispatch({ type: 'REQUEST_START' });

        const userData = {
            username: values.name,
            age: Number(values.age),
            weight: Number(values.weight),
            height: Number(values.height),
            startDate: values.startDate.format('YYYY-MM-DD'),
            activityLevel: values.activityLevel,
            target: values.target,
            gender: values.gender,
            password: values.password
        };

        try {
            // 1. Регистрация пользователя
            const userResponse = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!userResponse.ok) {
                throw new Error('Failed to register user');
            }

            const user = await userResponse.json();
            const userId = user.id || Date.now();

            // 2. Создание записи о диете
            await createDietRecord(userId);

            // 3. Сохранение данных
            const completeUser = {
                id: userId,
                ...userData
            };

            // Локальное хранилище
            localStorage.setItem('Name', values.name);
            localStorage.setItem('currentUser', JSON.stringify(completeUser));
            localStorage.setItem('userId', userId);
            setCookie('UserId', userId, { path: '/' });

            // Добавление в список пользователей
            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
            existingUsers.push({
                id: userId,
                name: values.name,
                password: values.password,
                userData: completeUser
            });
            localStorage.setItem('users', JSON.stringify(existingUsers));

            dispatch({ type: 'REQUEST_SUCCESS' });
        } catch (error) {
            console.error('Registration error:', error);
            dispatch({ type: 'REQUEST_ERROR', error: error.message });
        }
    };

    return (
        <div className={css.right}>
            <h2 className={css.title}>Registration</h2>
            <Form form={form} onFinish={handleRegister} className={css.form} layout="vertical">
                {/* Форма остается без изменений */}
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                >
                    <Input placeholder="Name" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password
                        placeholder="Enter your password"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>

                <Form.Item
                    name="age"
                    label="Age"
                    rules={[{ required: true, message: 'Please enter your age' }]}
                >
                    <Input type="number" min={1} />
                </Form.Item>

                <Form.Item
                    name="weight"
                    label="Weight (kg)"
                    rules={[{ required: true, message: 'Please enter your weight' }]}
                >
                    <Input type="number" min={1} />
                </Form.Item>

                <Form.Item
                    name="height"
                    label="Height (cm)"
                    rules={[{ required: true, message: 'Please enter your height' }]}
                >
                    <Input type="number" min={1} />
                </Form.Item>

                <Form.Item
                    name="startDate"
                    label="StartDate"
                    rules={[{ required: true, message: 'Please select a start date' }]}
                    initialValue={dayjs()}
                >
                    <DatePicker format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                    name="activityLevel"
                    label="ActivityLevel"
                    rules={[{ required: true, message: 'Please select activity level' }]}
                >
                    <Select placeholder="Select activity level">
                        <Option value="LOW">LOW</Option>
                        <Option value="MEDIUM">MEDIUM</Option>
                        <Option value="HIGH">HIGH</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="target"
                    label="Target"
                    rules={[{ required: true, message: 'Please select your target' }]}
                >
                    <Select placeholder="Select your target">
                        <Option value="GAIN_WEIGHT_2">Gain 2 kg</Option>
                        <Option value="GAIN_WEIGHT_5">Gain 5 kg</Option>
                        <Option value="GAIN_WEIGHT_10">Gain 10 kg</Option>
                        <Option value="LOSE_WEIGHT_2">Lose 2 kg</Option>
                        <Option value="LOSE_WEIGHT_5">Lose 5 kg</Option>
                        <Option value="LOSE_WEIGHT_10">Lose 10 kg</Option>
                        <Option value="STANDARD">Standard</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="gender"
                    label="Gender"
                    rules={[{ required: true, message: 'Please select your gender' }]}
                >
                    <Select placeholder="Select gender">
                        <Option value="MALE">MALE</Option>
                        <Option value="FEMALE">FEMALE</Option>
                    </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit" disabled={state.loading}>
                    Create
                </Button>

                <p>Do you have an account? <a onClick={() => setCheck(false)} style={{ cursor: "pointer" }}>Login</a></p>
            </Form>
        </div>
    );
};

export default Registration;