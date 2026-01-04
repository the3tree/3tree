import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Search, Send, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const conversations = [
    {
        id: "1",
        name: "Dr. Sarah Johnson",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0ea5e9&color=fff",
        lastMessage: "Looking forward to our next session!",
        time: "2 min ago",
        unread: 2,
        online: true,
    },
    {
        id: "2",
        name: "Dr. Michael Chen",
        avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=06b6d4&color=fff",
        lastMessage: "Please remember to complete the assessment.",
        time: "1 hour ago",
        unread: 0,
        online: false,
    },
];

const messages = [
    { id: 1, sender: "them", content: "Hi! How are you feeling today?", time: "10:00 AM" },
    { id: 2, sender: "me", content: "I'm doing better than last week. The breathing exercises really helped.", time: "10:02 AM" },
    { id: 3, sender: "them", content: "That's wonderful to hear! Let's build on that progress.", time: "10:03 AM" },
    { id: 4, sender: "me", content: "Yes, I'd like that. Can we also discuss sleep patterns?", time: "10:05 AM" },
    { id: 5, sender: "them", content: "Absolutely! We'll cover that in our next session. Looking forward to it!", time: "10:06 AM" },
];

export default function MessagesPage() {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const activeConversation = conversations.find(c => c.id === conversationId);

    const handleSend = () => {
        if (newMessage.trim()) {
            // In production, this would send to Supabase
            console.log("Sending:", newMessage);
            setNewMessage("");
        }
    };

    return (
        <>
            <Helmet>
                <title>Messages | 3-3.com Counseling</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar - Conversations List */}
                <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                            <Link to="/dashboard" className="text-primary text-sm font-medium">
                                Dashboard
                            </Link>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                to={`/messages/${conv.id}`}
                                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${conversationId === conv.id ? 'bg-primary/5' : ''
                                    }`}
                            >
                                <div className="relative">
                                    <img
                                        src={conv.avatar}
                                        alt={conv.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    {conv.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-gray-900 truncate">{conv.name}</p>
                                        <span className="text-xs text-gray-400">{conv.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unread > 0 && (
                                    <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {conv.unread}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                {conversationId && activeConversation ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link to="/messages" className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <img
                                    src={activeConversation.avatar}
                                    alt={activeConversation.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">{activeConversation.name}</p>
                                    <p className="text-xs text-green-500">
                                        {activeConversation.online ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                    <Phone className="w-5 h-5 text-gray-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                    <Video className="w-5 h-5 text-gray-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${msg.sender === 'me'
                                                ? 'bg-primary text-white rounded-br-md'
                                                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="bg-white p-4 border-t border-gray-100">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                <Button onClick={handleSend} className="btn-icy px-6">
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h3>
                            <p className="text-gray-500">Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
