import { useGameData } from '../context/GameDataContext';

export default function ScoreBoard() {
    const { scores, getHighScore } = useGameData();

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="card scoreboard">
            <h2 className="scoreboard-title">🏆 HIGH SCORES</h2>

            {scores.length === 0 ? (
                <p className="scoreboard-empty">No scores yet. Start playing!</p>
            ) : (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div className="hud-label">Best Score</div>
                        <div className="hud-value hud-value-large">{getHighScore()}</div>
                    </div>

                    <ul className="scoreboard-list">
                        {scores.map((entry, index) => (
                            <li key={entry.id} className="scoreboard-item">
                                <span className="scoreboard-rank">#{index + 1}</span>
                                <span className="scoreboard-score">{entry.score}</span>
                                <span className="scoreboard-time">{formatDateTime(entry.datetime)}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
