import { useState, useEffect, useRef } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { BrandLockup } from "#/components/brand";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { LogOut, MessageSquare, CheckCircle, Clock, Loader2, ArrowRight } from "lucide-react";
import { getSettingsFn } from "#/lib/settings.functions";
import {
  listAllChatsFn,
  getChatMessagesFn,
  sendSupportMessageFn,
  closeSupportChatFn,
} from "#/lib/support.functions";

export const Route = createFileRoute("/_dashboard/dashboard/support")({
  loader: async () => {
    const [settings, chats] = await Promise.all([
      getSettingsFn(),
      listAllChatsFn(),
    ]);
    return { settings, initialChats: chats };
  },
  component: DashboardSupportPage,
});

type ChatSession = {
  id: string;
  visitorId: string;
  customerEmail: string | null;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  chatId: string;
  sender: "customer" | "agent";
  content: string;
  createdAt: Date;
};

function DashboardSupportPage() {
  const { data: session } = authClient.useSession();
  const { settings, initialChats } = Route.useLoaderData();
  const shopName = settings.shopName || "My Shop";

  const [chats, setChats] = useState<ChatSession[]>(
    initialChats.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt).toISOString(),
      updatedAt: new Date(c.updatedAt).toISOString(),
    }))
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    initialChats.length > 0 ? initialChats[0].id : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll chat list every 5 seconds
  useEffect(() => {
    async function refreshChatList() {
      try {
        const updatedList = await listAllChatsFn();
        setChats(
          updatedList.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt).toISOString(),
            updatedAt: new Date(c.updatedAt).toISOString(),
          }))
        );
      } catch (err) {
        console.error("Failed to poll chat list:", err);
      }
    }

    const interval = setInterval(refreshChatList, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch and poll messages for selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    async function fetchMessages(showLoader = false) {
      if (showLoader) setLoadingMessages(true);
      try {
        const msgs = await getChatMessagesFn({ data: { chatId: selectedChatId! } });
        setMessages(
          msgs.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        if (showLoader) setLoadingMessages(false);
      }
    }

    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 3000); // Poll every 3s for active chat

    return () => clearInterval(interval);
  }, [selectedChatId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId || sending) return;

    const content = replyText.trim();
    setReplyText("");
    setSending(true);

    try {
      await sendSupportMessageFn({
        data: {
          chatId: selectedChatId,
          sender: "agent",
          content,
        },
      });

      // Instantly load new messages
      const msgs = await getChatMessagesFn({ data: { chatId: selectedChatId } });
      setMessages(
        msgs.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }))
      );
    } catch (err) {
      console.error("Failed to send support reply:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleCloseChat() {
    if (!selectedChatId) return;

    try {
      await closeSupportChatFn({ data: { chatId: selectedChatId } });
      // Update local state
      setChats((prev) =>
        prev.map((c) => (c.id === selectedChatId ? { ...c, status: "closed" } : c))
      );
    } catch (err) {
      console.error("Failed to close chat:", err);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <BrandLockup shopName={shopName} />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              <a
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </a>
              <a
                href="/analytics"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Analytics
              </a>
              <a
                href="/support"
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
              >
                Support
              </a>
              <a
                href="/settings"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Settings
              </a>
              <a
                href="/"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Storefront
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {session?.user && (
              <div className="hidden max-w-[220px] truncate rounded-lg border border-border/80 bg-card px-3 py-1.5 text-sm text-muted-foreground sm:block">
                {session.user.email}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/login";
                    },
                  },
                });
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Support Inbox</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your shop support tickets and reply directly to customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch min-h-[500px]">
            {/* Sidebar Chat List */}
            <div className="md:col-span-1 border border-border/80 rounded-2xl bg-card overflow-hidden flex flex-col">
              <div className="border-b border-border/60 p-4 font-semibold text-sm">
                Active Conversations
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border/50 max-h-[600px]">
                {chats.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No support chats active.
                  </div>
                ) : (
                  chats.map((c) => {
                    const isSelected = c.id === selectedChatId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChatId(c.id)}
                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex flex-col gap-2 ${
                          isSelected ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-[10px] text-muted-foreground max-w-[120px] truncate">
                            ID: {c.visitorId.slice(0, 8)}...
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(c.updatedAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {c.customerEmail && (
                          <div className="text-xs font-medium text-foreground truncate">
                            {c.customerEmail}
                          </div>
                        )}
                        <div className="flex items-center justify-between w-full mt-1">
                          {c.status === "closed" ? (
                            <Badge variant="secondary" className="text-[10px] py-0.5 px-2">
                              Resolved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] py-0.5 px-2">
                              Open
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Messages Details */}
            <div className="md:col-span-2 border border-border/80 rounded-2xl bg-card overflow-hidden flex flex-col">
              {selectedChat ? (
                <div className="flex flex-col flex-1 h-full">
                  {/* Chat details bar */}
                  <div className="border-b border-border/60 p-4 flex items-center justify-between bg-muted/20">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-semibold">
                        {selectedChat.customerEmail || `Visitor ${selectedChat.visitorId.slice(0, 8)}`}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        Visitor ID: <span className="font-mono">{selectedChat.visitorId}</span>
                      </div>
                    </div>
                    {selectedChat.status === "open" && (
                      <Button variant="outline" size="sm" onClick={handleCloseChat} className="text-xs gap-1.5">
                        <CheckCircle className="size-4 text-emerald-600" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>

                  {/* Message log */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[350px] max-h-[450px] bg-muted/10">
                    {loadingMessages ? (
                      <div className="flex flex-1 items-center justify-center">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                        No messages in this chat.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {messages.map((msg) => {
                          const isAgent = msg.sender === "agent";
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] gap-1 ${
                                isAgent ? "self-end items-end" : "self-start items-start"
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                                  isAgent
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-accent/80 text-foreground rounded-tl-sm"
                                }`}
                              >
                                {msg.content}
                              </div>
                              <span className="text-[10px] text-muted-foreground px-1">
                                {isAgent ? "Support Agent" : "Customer"} • {msg.createdAt.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="border-t border-border/60 p-4">
                    {selectedChat.status === "closed" ? (
                      <div className="text-center py-2 text-sm text-muted-foreground">
                        This session is resolved and closed.
                      </div>
                    ) : (
                      <form onSubmit={handleSendReply} className="flex gap-2">
                        <Input
                          placeholder="Type your response..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          required
                          disabled={sending}
                          className="flex-1 bg-background"
                        />
                        <Button type="submit" disabled={sending || !replyText.trim()}>
                          {sending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <>
                              Reply
                              <ArrowRight className="size-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <MessageSquare className="size-12 opacity-30 mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-medium">No conversation selected</p>
                  <p className="text-xs mt-1">Select a ticket from the left panel to begin replying.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
