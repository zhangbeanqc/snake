import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            login(username);
        }
    };

    return (
        <div className="login-container">
            <div className="card card-glow login-card">
                <div className="login-snake-art">
                    {`  ____              _         
 / ___| _ __   __ _| | _____  
 \\___ \\| '_ \\ / _\` | |/ / _ \\ 
  ___) | | | | (_| |   <  __/ 
 |____/|_| |_|\\__,_|_|\\_\\___| `}
                </div>

                <h1 className="login-title">NEON SNAKE</h1>
                <p className="login-subtitle">Enter the arcade</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Player Name</label>
                        <input
                            type="text"
                            id="username"
                            className="input"
                            placeholder="Enter your name..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                            autoFocus
                            maxLength={20}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Start Playing
                    </button>
                </form>
            </div>
        </div>
    );
}
