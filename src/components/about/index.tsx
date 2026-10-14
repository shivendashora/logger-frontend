// what's been built so far — update these lists as features land

const features = [
    {
        icon: "🔐",
        title: "Accounts & login",
        points: [
            "Sign up and sign in with email and password",
            "Passwords are hashed with bcrypt before they're stored",
            "Login returns a JWT (valid for 30 minutes) kept in a cookie",
            "Protected pages redirect to login when the token is missing or expired",
        ],
    },
    {
        icon: "🗂️",
        title: "Logs dashboard",
        points: [
            "Home page loads your own logs from the database",
            "Each log is a frosted-glass card in a responsive grid",
            "Loading, error and empty states while logs are fetched",
        ],
    },
    {
        icon: "➕",
        title: "Create log",
        points: [
            "Dedicated page with name, description and a file attachment",
            "Attachments must be a PDF or an image (png, jpg, gif, webp), up to 10 MB",
            "Checked in the browser and again on the server, which reads the file's real format",
        ],
    },
    {
        icon: "📄",
        title: "Log view, preview & download",
        points: [
            "Open any card to read the full log",
            "Images preview inline; PDFs open in the browser's built-in viewer",
            "Download saves the file under its original name, and only the owner can download it",
            "Logs without an attachment use the full width",
        ],
    },
    {
        icon: "📱",
        title: "Design & responsiveness",
        points: [
            "Glassmorphism look: blurred, translucent cards over soft colour glows",
            "Compact navbar with a menu on phones",
            "Pages scroll correctly on phones, with no rubber-band overscroll",
        ],
    },
];

const stack = [
    { side: "Frontend", items: ["React 19", "TypeScript", "Vite", "Tailwind CSS v4", "React Router"] },
    { side: "Backend", items: ["FastAPI", "SQLAlchemy", "PostgreSQL", "JWT (PyJWT)", "bcrypt"] },
];

const endpoints = [
    { method: "POST", path: "/sign-in", what: "Create an account" },
    { method: "POST", path: "/login", what: "Sign in and get a token" },
    { method: "GET", path: "/get-logs", what: "List the signed-in user's logs" },
    { method: "POST", path: "/logFormData", what: "Create a log with an attachment" },
    { method: "GET", path: "/logs/{id}/download", what: "Download a log's attachment (owner only)" },
    { method: "GET", path: "/uploads/{file}", what: "Serve attachments for preview" },
];

const nextUp = [
    "Save card edits to the database (Edit/Save currently only changes the page)",
    "Delete logs",
    "Require login for attachment previews, not just downloads",
];

export default function About(){
    return (
        <div className="w-full flex-1 min-h-0 overflow-y-auto overscroll-none scrollbar-hidden px-4 sm:px-8 pb-10">
            <div className="max-w-5xl mx-auto flex flex-col gap-6 text-white">

                <header className="glass-card backdrop-blur-lg rounded-2xl p-6 sm:p-8 flex flex-col gap-3">
                    <h1 className="text-2xl sm:text-3xl font-semibold">About Logger App</h1>
                    <p className="text-white/75 text-base sm:text-lg font-normal leading-relaxed">
                        Logger App is a place to keep short logs, each with a description and an attached PDF or image.
                        This page sums up what has been built so far.
                    </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature) => (
                        <div key={feature.title} className="glass-card backdrop-blur-lg rounded-2xl p-5 flex flex-col gap-3">
                            <h2 className="text-lg font-medium">{feature.icon} {feature.title}</h2>
                            <ul className="flex flex-col gap-2 text-sm sm:text-base text-white/75 font-normal">
                                {feature.points.map((point) => (
                                    <li key={point} className="flex gap-2">
                                        <span className="text-white/40">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                <section className="glass-card backdrop-blur-lg rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-medium">🧰 Tech stack</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {stack.map((group) => (
                            <div key={group.side} className="flex flex-col gap-2">
                                <span className="text-sm text-white/50 font-normal">{group.side}</span>
                                <div className="flex flex-wrap gap-2">
                                    {group.items.map((item) => (
                                        <span key={item} className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sm font-normal">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="glass-card backdrop-blur-lg rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-medium">🔌 API endpoints</h2>
                    <ul className="flex flex-col divide-y divide-white/10 font-normal">
                        {endpoints.map((endpoint) => (
                            <li key={endpoint.path} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <span className="flex items-center gap-2 sm:w-72 shrink-0">
                                    <span className={`w-12 text-center text-xs font-semibold rounded px-1.5 py-0.5 ${endpoint.method === "GET" ? "bg-sky-500/25 text-sky-200" : "bg-violet-500/25 text-violet-200"}`}>
                                        {endpoint.method}
                                    </span>
                                    <code className="text-sm break-all">{endpoint.path}</code>
                                </span>
                                <span className="text-sm text-white/70">{endpoint.what}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="glass-card backdrop-blur-lg rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
                    <h2 className="text-lg font-medium">🚧 Coming next</h2>
                    <ul className="flex flex-col gap-2 text-sm sm:text-base text-white/75 font-normal">
                        {nextUp.map((item) => (
                            <li key={item} className="flex gap-2">
                                <span className="text-white/40">○</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

            </div>
        </div>
    )
}
