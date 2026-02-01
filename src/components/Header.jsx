import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();

    const formatLoginTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <header className="header">
            <div className="header-logo">🐍 NEON SNAKE</div>

            {user && (
                <div className="header-user">
                    <div>
                        <span className="header-username">{user.username}</span>
                        <span className="header-login-time"> • Logged in: {formatLoginTime(user.loginTime)}</span>
                    </div>
                    <button className="btn btn-secondary btn-small" onClick={logout}>
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}
