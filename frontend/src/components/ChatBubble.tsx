interface Props {
  role: "user" | "assistant"
  content: string
}

export default function ChatBubble({ role, content }: Props) {
  const isUser = role === "user"

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
        ${isUser ? "bg-green-800 text-green-200" : "bg-gray-700 text-white"}`}>
        {isUser ? "👤" : "🌱"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? "bg-green-800 text-green-50 rounded-tr-sm"
          : "bg-gray-800 text-gray-100 rounded-tl-sm"
        }`}>
        {content.split("\n").map((line, i) => (
          <p key={i} className={line === "" ? "mt-2" : ""}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}