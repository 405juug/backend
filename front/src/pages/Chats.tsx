import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatSocket } from "../chat/useChatSocket";
import "./Chats.css";

const BACKEND_URL = "http://localhost:3000";

const MOCK_CHATS = [
    { id: 1, name: "Общий", room: "general" },
    { id: 2, name: "Случайный", room: "random" },
];

export default function Chats() {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    const { status, messages, connect, disconnect, sendMessage } = useChatSocket(BACKEND_URL);

    // Получаем username из аккаунта
    useEffect(() => {
        const fetchMe = async () => {
            const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.auth) setUsername(data.user.username);
        };
        fetchMe();
    }, []);

    const handleSelectChat = (room: string, name: string) => {
        if (!username) return;
        setSelectedRoom(room);
        setSelectedName(name);
        connect({ room, nickname: username });
    };

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input.trim());
        setInput("");
    };

    return (
        <div className="chats-container">
            <div className="chats-sidebar">
                <div className="chats-sidebar-header">
                    <button onClick={() => { disconnect(); navigate("/home"); }} className="chats-back-btn">
                        ←
                    </button>
                    <strong>Чаты</strong>
                </div>

                {MOCK_CHATS.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.room, chat.name)}
                        className={`chats-item ${selectedRoom === chat.room ? "chats-item--active" : ""}`}
                    >
                        <div className="chats-item-name">{chat.name}</div>
                        <div className="chats-item-last">
                            {selectedRoom === chat.room ? status : ""}
                        </div>
                    </div>
                ))}
            </div>

            <div className="chats-main">
                {selectedRoom ? (
                    <>
                        <div className="chats-chat-header">
                            {selectedName}
                            <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>
                                {status}
                            </span>
                        </div>

                        <div className="chats-messages">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={
                                        msg.kind === "system"
                                            ? "chats-message chats-message--system"
                                            : msg.author === username
                                                ? "chats-message chats-message--me"
                                                : "chats-message chats-message--them"
                                    }
                                >
                                    {msg.kind !== "system" && (
                                        <div className="chats-message-author">{msg.author}</div>
                                    )}
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        <div className="chats-input-row">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Сообщение..."
                                className="chats-input"
                                disabled={status !== "connected"}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSend();
                                }}
                            />
                            <button
                                onClick={handleSend}
                                className="chats-send-btn"
                                disabled={status !== "connected"}
                            >
                                →
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="chats-empty">Выберите чат</div>
                )}
            </div>
        </div>
    );
}