import { useState } from "react"

interface Props {
  role: "user" | "assistant"
  content: string
}

export default function ChatBubble({ role, content }: Props) {
  const isUser = role === "user"
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-start gap-3 group ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
        ${isUser ? "bg-green-800 text-green-200" : "bg-gray-700 text-white"}`}>
        {isUser ? "👤" : "🌱"}
      </div>

      {/* Bubble + copy */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? "bg-green-800 text-green-50 rounded-tr-sm"
            : "bg-gray-800 text-gray-100 rounded-tl-sm"
          }`}>
          {content.split("\n").map((line, i) => (
            <p key={i} className={line === "" ? "mt-2" : ""}>{line}</p>
          ))}
        </div>

        {/* Copy button — assistant only, visible on hover */}
        {!isUser && (
          <button
            onClick={copy}
            className="opacity-0 group-hover:opacity-100 text-xs text-gray-600 hover:text-gray-400 transition-all px-1"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  )
}