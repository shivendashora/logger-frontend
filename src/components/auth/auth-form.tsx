import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

type Mode = "login" | "signup";

const inputClass = "w-full px-4 py-2 bg-transparent border border-gray-400 rounded-lg text-white text-base font-normal outline-none focus:border-white";

export default function AuthForm({ mode }: { mode: Mode }){
    const isSignup = mode === "signup";
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isSignup && password.length < 6) return setError("Password must be at least 6 characters");
        if (isSignup && password !== confirm) return setError("Passwords do not match");

        // no auth backend yet, just go to the home page
        navigate("/");
    }

    return (
        <div className="w-full flex-1 flex items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 p-6 border border-gray-400 rounded-lg text-white">
                <h1 className="text-2xl font-semibold text-center">
                    {isSignup ? "Sign up" : "Sign in"}
                </h1>

                {isSignup && (
                    <input className={inputClass} placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
                )}
                <input className={inputClass} type="email" placeholder="Email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={inputClass} type="password" placeholder="Password" required autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                {isSignup && (
                    <input className={inputClass} type="password" placeholder="Confirm password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                )}

                {error && <span className="text-red-400 text-sm">{error}</span>}

                <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg cursor-pointer hover:bg-gray-300">
                    {isSignup ? "Create account" : "Sign in"}
                </button>

                <span className="text-sm text-gray-400 text-center">
                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                    <Link to={isSignup ? "/login" : "/signup"} className="text-white underline hover:text-gray-400">
                        {isSignup ? "Sign in" : "Sign up"}
                    </Link>
                </span>
            </form>
        </div>
    )
}
