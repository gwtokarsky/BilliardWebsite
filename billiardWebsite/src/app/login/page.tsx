"use client";
import React, { useState } from 'react';
import { getUser, loginUser } from '@/actions/actions';
import { ToastContainer, toast } from 'react-toastify';
import background from "/public/Geometric-Background-1187.png";
import 'react-toastify/dist/ReactToastify.css';

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
                toast.error('Login Failed', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            const user = await getUser(username);

            window.location.href = `/`;
        }
    };

    return (
        <div
            style={{
                backgroundImage: `url(${background.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div style={styles.container}>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <h1>Login</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            style={styles.input}
                            maxLength={30}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            style={styles.input}
                            maxLength={30}
                        />
                    </div>
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                <button onClick={() => window.location.href = '/register'} style={styles.smallButton}>
                    No account? Register
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9f9f9',
        padding: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    inputGroup: {
        marginBottom: '15px',
        width: '100%',
    },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box' as 'border-box',
    },
    button: {
        padding: '10px 20px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        width: '100%',
        maxWidth: '150px',
    },
    smallButton: {
        marginTop: '15px',
        padding: '5px 10px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#6c757d',
        color: '#fff',
        cursor: 'pointer',
        width: 'auto',
        fontSize: '12px',
    }
};

export default LoginPage;