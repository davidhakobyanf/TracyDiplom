import './App.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Content from './Content/Content';
import FormContainer from './Form/FormContainer';
import Profile from './Profile/Profile';

const router = createBrowserRouter([
    {
        path: '/healthhybite',
        element: <Content/>,
        children: [
            {
                path: '/healthhybite',
                element: <FormContainer/>,
            },
            {
                path: '/healthhybite/profile',
                element: (
                    <Profile/>
                ),
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
