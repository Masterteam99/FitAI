"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, User, Loader2, Zap } from "lucide-react";
import { copy } from "@/content/copy";

interface Message { role: "user" | "assistant"; content: string }

const SUGGESTIONS = copy.aiCoach.suggestions;

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: copy.aiCoach.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || isLoading) return;
    setInput("");

    const userMessage: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMessage]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: messages.slice(-10) }),
      });
      if (!res.ok || !res.body) throw new Error(copy.aiCoach.genericError);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullText } : m));
      }
    } catch {
      setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: copy.aiCoach.errorMessage } : m));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" />
          {copy.aiCoach.title}
        </h1>
        <p className="text-muted-foreground">{copy.aiCoach.subtitle}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-primary" />
              </div>
            )}
            <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
              <CardContent className="p-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </CardContent>
            </Card>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)} className="text-left p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors border border-border">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={copy.aiCoach.inputPlaceholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} size="icon" aria-label={copy.aiCoach.sendAria}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
