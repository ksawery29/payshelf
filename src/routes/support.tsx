import { useState, useEffect, useRef } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getSettingsFn } from '#/lib/settings.functions';
import { BrandLockup } from '#/components/brand';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import { ArrowLeft, Send, MessageSquare, Loader2 } from 'lucide-react';
import { getOrCreateVisitorId } from '#/lib/events.functions';
import {
  getOrCreateSupportChatFn,
  getChatMessagesFn,
  sendSupportMessageFn,
} from '#/lib/support.functions';

export const Route = createFileRoute('/support')({
  loader: async () => {
    const settings = await getSettingsFn();
    return { settings };
  },
  component: SupportPage,
});

type Message = {
  id: string;
  chatId: string;
  sender: 'customer' | 'agent';
  content: string;
  createdAt: Date;
};

function SupportPage() {
  const { settings } = Route.useLoaderData();
  const shopName = settings.shopName || 'My Shop';

  const [visitorId, setVisitorId] = useState('');
  const [chat, setChat] = useState<{
    id: string;
    status: string;
    customerEmail: string | null;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get or create visitor ID on mount
  useEffect(() => {
    const vid = getOrCreateVisitorId();
    setVisitorId(vid);
  }, []);

  // Fetch or create chat session once visitorId is ready
  useEffect(() => {
    if (!visitorId) return;

    async function initChat() {
      try {
        const activeChat = await getOrCreateSupportChatFn({
          data: { visitorId },
        });
        setChat(activeChat);
        if (activeChat.customerEmail) {
          setEmailInput(activeChat.customerEmail);
        }
      } catch (err) {
        console.error('Failed to initialize support chat:', err);
      } finally {
        setLoadingChat(false);
      }
    }

    initChat();
  }, [visitorId]);

  // Poll for new messages when chat is active
  useEffect(() => {
    if (!chat?.id) return;

    async function fetchMessages() {
      try {
        const msgs = await getChatMessagesFn({ data: { chatId: chat.id } });
        // Map raw strings/timestamps if needed
        setMessages(
          msgs.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          }))
        );
      } catch (err) {
        console.error('Failed to poll messages:', err);
      }
    }

    fetchMessages(); // Initial fetch
    const interval = setInterval(fetchMessages, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, [chat?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim() || !visitorId) return;

    try {
      const activeChat = await getOrCreateSupportChatFn({
        data: { visitorId, customerEmail: emailInput.trim() },
      });
      setChat(activeChat);
    } catch (err) {
      console.error('Failed to associate email with support chat:', err);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageInput.trim() || !chat || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      await sendSupportMessageFn({
        data: {
          chatId: chat.id,
          sender: 'customer',
          content,
        },
      });
      // Immediately fetch new list
      const msgs = await getChatMessagesFn({ data: { chatId: chat.id } });
      setMessages(
        msgs.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }))
      );
    } catch (err) {
      console.error('Failed to send support message:', err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/">
            <BrandLockup shopName={shopName} />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to store
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex flex-1 w-full max-w-4xl items-center justify-center px-4 py-8 sm:px-6">
        {loadingChat ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm">Connecting to support...</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            {/* Double-Bezel Nested Architecture */}
            <div className="rounded-[2rem] border border-border/50 bg-muted/20 p-2 shadow-sm">
              <div className="rounded-[calc(2rem-0.5rem)] border border-border/80 bg-card p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <div className="flex flex-col gap-6">
                  {/* Header info */}
                  <div className="flex items-start justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <MessageSquare className="size-5" />
                      </div>
                      <div>
                        <h1 className="font-heading text-lg font-semibold tracking-tight">
                          Customer Support
                        </h1>
                        <p className="text-xs text-muted-foreground">
                          We typically reply in a few minutes
                        </p>
                      </div>
                    </div>
                    {chat?.status === 'closed' ? (
                      <Badge variant="secondary">Resolved</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        Live chat
                      </Badge>
                    )}
                  </div>

                  {/* Optional Email Prompt */}
                  {!chat?.customerEmail && (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                      <form onSubmit={handleUpdateEmail} className="flex flex-col gap-3">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Link your email</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Provide your email so we can reach you if you close this page.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            required
                            className="bg-background max-w-xs"
                          />
                          <Button type="submit" size="sm">
                            Link Email
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Messages box */}
                  <div className="flex flex-col gap-4 min-h-[300px] max-h-[400px] overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center text-center p-8 text-muted-foreground">
                        <MessageSquare className="size-8 opacity-40 mb-2" strokeWidth={1.5} />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs mt-1">
                          Send a message below to start chatting with us.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {messages.map((msg) => {
                          const isCustomer = msg.sender === 'customer';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[80%] gap-1 ${
                                isCustomer ? 'self-end items-end' : 'self-start items-start'
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                                  isCustomer
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                    : 'bg-accent/80 text-foreground rounded-tl-sm'
                                }`}
                              >
                                {msg.content}
                              </div>
                              <span className="text-[10px] text-muted-foreground px-1">
                                {msg.createdAt.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Send Input */}
                  {chat?.status === 'closed' ? (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      This support session has been closed. If you need further help, please start a
                      new session.
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        required
                        disabled={sending}
                        className="flex-1 bg-background"
                      />
                      <Button
                        type="submit"
                        disabled={sending || !messageInput.trim()}
                        className="rounded-full shrink-0"
                      >
                        {sending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            Send
                            <Send className="size-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
