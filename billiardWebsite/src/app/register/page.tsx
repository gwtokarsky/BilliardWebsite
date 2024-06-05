"use client";
import React, { useState } from 'react';
import handle_submit from '../handle_submit';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleUsernameChange = (event: any) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: any) => {
        setPassword(event.target.value);
    };

    const handleNameChange = (event: any) => {
        setName(event.target.value);
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        await handle_submit(username, name, password);
        // Switch to login page
        window.location.href = `/login`;
    };

    return (
        <div style={styles.container}>
            <h1>Register</h1>
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
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        style={styles.input}
                        maxLength={50}
                    />
                </div>
                <p style={{ fontSize: '10px', textAlign: 'center' }}>
                    Note, the message that will be displayed when a cover is complete is: Cover Completed by {name}
                </p>
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
                <button type="submit" style={styles.button}>Register</button>
            </form>
            <button onClick={() => window.location.href = '/login'} style={styles.smallButton}>
                Already registered? Login
            </button>
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

export default RegisterPage;