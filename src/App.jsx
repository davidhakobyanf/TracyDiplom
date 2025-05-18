import './App.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Content from './Content/Content';
import FormContainer from './Form/FormContainer';
import Profile from './Profile/Profile';
import Admin from "./Admin/Admin";

const router = createBrowserRouter([
    {
        path: '/healthhybite',
        element: <Content/>,
        children: [
            {
                index: true,
                element: <FormContainer/>,
            },
            {
                path: 'profile',
                element: <Profile/>,
            },
            {
                path: 'admin',
                element: <Admin/>,
            },
        ],
    },
]);

function App() {
    return (
        <RouterProvider router={router}/>
    );
}

export default App;