import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import css from './Content.module.css';
import {useCookies} from "react-cookie";

const Content = () => {
    const navigate = useNavigate();
    const [cookies] = useCookies(['UserId']);

    useEffect(() => {
        const userId = cookies.UserId;
        if (userId && userId === 'admin') {
            navigate('/healthhybite/admin');
        }else  if  (userId && userId !== 'admin') {
            navigate('/healthhybite/profile');
        } else {
            navigate('/healthhybite');
        }
    }, [cookies, navigate]);

    return (
        <div className={css.content}>
            <Outlet />
        </div>
    );
};

export default Content;
