import { useEffect, useState } from "react";


interface Post{
    id: number;
    title: string;
    content?: string;
    author: { username: string };
}

export default function Home(){
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchPosts = async () => {
        const res = await fetch("http://localhost:3000/api/posts", {
            credentials: "include",
        });
        const data = await res.json();
        setPosts(data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        setLoading(true);
        const res = await fetch("http://localhost:3000/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title, content })
        });

        if(res.ok) {
            setTitle("")
            setContent("")
            fetchPosts();
        } else {
            alert("Ошибка при создании поста");
        }

        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 600, margin: "50px auto" }}>
            <h1>Посты</h1>

            <form onSubmit={handleCreatePost} style={{ marginBottom: 20 }}>
                <input
                    placeholder="Заголовок"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: 10 }}
                />

                <textarea
                    placeholder="Содержание"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style = {{ width: "100%", marginBottom: 10 }}
                />

                <button disabled={loading}>{ loading ? "..." : "Создать пост"}</button>
            </form>

            <div>
                {posts.map((post) => (
                    <div key={post.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        <small>Автор: {post.author.username}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
