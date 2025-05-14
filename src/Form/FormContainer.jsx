import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Form as AntdForm } from 'antd';
import css from './FormContainer.module.css';
import Login from './Login/Login';
import {useCookies} from "react-cookie";
import Registration from "./Registration/Registration";

const FormContainer = () => {
    const [form] = AntdForm.useForm();
    const [check, setCheck] = useState(false)

    useEffect(() => {
        localStorage.setItem('admin', JSON.stringify({ name: 'Admin1', password: 'Admin1!' }));
    }, []);

    return (
        <div className={css.container}>
            <div className={css.block}>
                <div className={css.left}></div>
                {!check && <Login form={form} setCheck={setCheck}/>}
                {check && <Registration form={form} setCheck={setCheck}/>}
            </div>
        </div>
    );
};

export default FormContainer;
