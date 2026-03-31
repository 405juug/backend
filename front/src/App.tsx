import {useEffect, useState} from "react";
import './App.css';
import {useNavigate} from "react-router-dom";

export default function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            let res = await fetch("http://localhost:3000/api/auth/me", {
                credentials: "include",
            });

            if (res.status === 401){
                const refreshRes = await fetch("http://localhost:3000/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                })

                if(refreshRes.ok){
                    res = await fetch("http://localhost:3000/api/auth/me", {
                        credentials: "include",
                    });
                }
            }

            const data = await res.json();

            if (data.auth) {
                navigate("/home");
            }
        };

        checkAuth();
    }, []);


    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const url = isLogin
            ? "http://localhost:3000/api/auth/login"
            : "http://localhost:3000/api/auth/register";

        const body = isLogin
            ? { email, password }
            : { username, email, password };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка");
            } else {
                console.log("SUCCESS", data);
                window.location.href = ("/home");
            }
        } catch (e) {
            setError("Сервер недоступен");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">{isLogin ? "Вход" : "Регистрация"}</h2>

            <form className="auth-form" onSubmit={submit}>
                {!isLogin && (
                    <input
                        className="auth-input"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                )}

                <input
                    className="auth-input"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <button className="auth-button" disabled={loading}>
                    {loading ? "..." : isLogin ? "Войти" : "Зарегистрироваться"}
                </button>
            </form>

            {error && <p className="auth-error">{error}</p>}

            <button
                className="auth-toggle"
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
            </button>
        </div>
    );
}