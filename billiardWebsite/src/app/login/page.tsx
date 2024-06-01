"use client";
import React, { useState } from 'react';
import handle_submit from '../handle_submit';
import { getUser, loginUser } from '@/actions/actions';



const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (event: any) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: any) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        
        if (!username || !password) {
            console.log('Please enter a username and password');
        } else {
            const userSuccess = await loginUser(username, password);
            if (userSuccess) {
                console.log('User logged in successfully');
            } else {
                console.log('User not found');
            }

            const user = await getUser(username);
            console.log(user.id);

            //Redirect to main page but with user id
            window.location.href = `/?user_id=${user.id}`;
        }
        

    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>
                <button type="submit" onClick={handleSubmit}>Login</button>
            </form>
        </div>
    );
};

export default LoginPage;