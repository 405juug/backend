import { type JSX, useEffect, useState} from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try{
                const res = await fetch("http://localhost:3000/api/auth/me", {
                    credentials: "include",
                });

                const data = await res.json();

                if(data.auth){
                    setIsAuth(true);
                }
            } catch(err){
                setIsAuth(false);
            }

            setLoading(false);
        }

        checkAuth();
    }, [])

    if (loading) return <p>Загрузка...</p>;
    if(!isAuth){
        return <Navigate to="/" replace />;
    }

    return children;
}
