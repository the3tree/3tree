import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Minimize2,
  Maximize2,
  Heart,
  Brain,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Get API key from environment variable
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Website knowledge base - comprehensive data about The 3 Tree
const WEBSITE_KNOWLEDGE = `
## About The 3 Tree

The 3 Tree is a mental wellness and therapy platform founded by Shraddha Gurung. We provide professional therapy and mental wellness services, helping individuals feel seen, heard, and understood.

### Our Founder - Shraddha Gurung
Shraddha Gurung is the Founder and Clinical Psychologist at The 3 Tree. Her journey into psychology started from a childhood fascination with how people behave differently in public versus their private moments. Through her own struggles with understanding patterns and reactions, she explored spirituality and the deeper layers of the self.

Key insights from Shraddha:
- "We come to know ourselves best through our interactions with other people."
- "Our soul's language is universal and deeply connected."
- "Our purpose doesn't reveal itself when we are perfect, it reveals itself when we understand ourselves."

Shraddha's expertise includes: Anxiety, Depression, Stress, Trauma, and Relationships. She speaks English, Hindi, and Nepali.

### Soul's Language - Core Values
The 3 Tree believes in these universal soul needs:
- Connection: Need to feel seen, understood, and mirrored
- Love: Need compassion and safety for deeper intimacy
- Truth: Need to live aligned, authentic, free from masks
- Growth: Need to embrace challenges toward highest potential
- Freedom: Need to release fears, patterns, and limiting conditioning
- Peace: Need stillness when body, mind, and spirit are aligned
- Meaning: Need purpose giving struggles context and wisdom
- Joy: Need alignment with values for lasting happiness
- Compassion: Need to understand suffering, respond gently
- Presence: Need to feel fully alive, aware, grounded

### Our Services

1. **Individual Therapy** - One-on-one therapy to explore feelings, understand patterns, and grow emotionally. Uses CBT, Mindfulness-Based Therapy, Person-Centered Approach, and Trauma-Informed Care. Price: ₹1,800 for 50 mins.

2. **Couple Therapy** - For couples to explore relationship dynamics, enhance understanding, manage disagreements, and nurture intimacy.

3. **Group Therapy** - Share experiences with peers, explore common challenges, receive support, and develop practical strategies.

4. **Child & Adolescent Therapy** - For children (5-12) and teens (13-17) using Play Therapy and Art Therapy. Parental consent required.

5. **Holistic Consciousness Coaching** - Blending mental health strategies with mind-body-spirit practices for self-awareness and purposeful living.

### Session Modes
- **Online Sessions**: Secure video sessions from anywhere
- **Chat Support**: Text-based therapy for flexible communication
- **In-Person**: Face-to-face sessions at our center

### Assessments Available
We offer several psychological assessments:
- PHQ-9 (Depression)
- GAD-7 (Anxiety)
- PSS (Stress)
- BFI (Personality)
- PTSD Assessment
- DAST (Substance Use)
- SCOFF (Eating Disorders)

### Location & Contact
- Location: Sikkim, India
- Email: hello@the3tree.com
- Hours: Mon-Sat: 9AM - 6PM

### Why Choose The 3 Tree?
- Compassion First: Every session with empathy and genuine care
- Personalized Care: Tailored therapeutic approaches for unique needs
- Holistic Healing: Mind, body, and soul - complete wellbeing
- Licensed Professionals: All therapists are licensed with verified credentials
- Confidential: All sessions are completely confidential and HIPAA-compliant

### Our Mission
To provide a welcoming, judgment-free space where individuals, couples, and families can explore their emotions, overcome challenges, and discover their path to mental wellness and personal growth.

### Our Vision
We envision a world where every individual can:
- Know themselves deeply through reflection, presence, and authentic connection
- Heal deeply, integrating emotional, physical, and spiritual well-being
- Align with their soul's language, living courageously, authentically, and in balance

### Booking Information
- Sessions can be booked through our website
- Browse available psychologists and choose convenient time slots
- Appointments can be rescheduled or canceled with 24 hours notice
- Pay per session or choose packages for long-term support

### Therapy Approaches Used
- Cognitive Behavioral Therapy (CBT)
- Mindfulness-Based Therapy
- Person-Centered Therapy
- Trauma-Informed Care
- Dialectical Behavior Therapy (DBT)
- Integrative Methods
`;

// System prompt for psychological support
const SYSTEM_PROMPT = `You are The 3 Tree Assistant, a warm and compassionate AI wellness companion for The 3 Tree - a mental wellness and therapy platform founded by Shraddha Gurung. Your role is to:

1. Provide empathetic, supportive responses to users exploring mental wellness
2. Share information about The 3 Tree's services, team, and approach
3. Help users understand their emotions and guide them toward professional help when needed
4. Answer questions about therapy, mental health, and our services

IMPORTANT GUIDELINES:
- Always be warm, empathetic, and non-judgmental
- Never diagnose or provide medical advice
- For serious concerns, gently encourage booking a session with a professional therapist
- Use conversational, caring language
- Keep responses concise but meaningful (2-4 paragraphs max)
- If asked about emergencies or crisis situations, direct them to local emergency services
- Respect confidentiality and privacy
- Reference The 3 Tree's services naturally when relevant

KNOWLEDGE BASE:
${WEBSITE_KNOWLEDGE}

Remember: You're here to support, not replace, professional therapy. Be the first gentle step in someone's wellness journey.`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Heart, text: "How can therapy help me?", color: "text-rose-500", bg: "bg-rose-50", hoverBg: "group-hover:bg-rose-100" },
  { icon: Brain, text: "Tell me about your services", color: "text-violet-500", bg: "bg-violet-50", hoverBg: "group-hover:bg-violet-100" },
  { icon: HelpCircle, text: "Who is Shraddha Gurung?", color: "text-amber-500", bg: "bg-amber-50", hoverBg: "group-hover:bg-amber-100" },
  { icon: Calendar, text: "How do I book a session?", color: "text-emerald-500", bg: "bg-emerald-50", hoverBg: "group-hover:bg-emerald-100" },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setShowWelcome(false);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowWelcome(false);

    try {
      // Check if API key is available
      if (!OPENROUTER_API_KEY) {
        throw new Error("API key not configured");
      }

      console.log("Sending request to OpenRouter...");
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "The 3 Tree Chatbot",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "user", content: `${SYSTEM_PROMPT}\n\nUser question: ${content.trim()}` },
            ...messages.slice(-5).map((m) => ({ role: m.role === "assistant" ? "model" : "user", content: m.content })),
          ],
          temperature: 0.7,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      const assistantContent = data.choices?.[0]?.message?.content || "I apologize, but I'm having trouble responding right now. Please try again.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Provide intelligent fallback responses based on user query
      let fallbackContent = "I'm having trouble connecting to my AI service right now. ";
      
      const query = content.toLowerCase();
      
      if (query.includes("service") || query.includes("therapy") || query.includes("counselling")) {
        fallbackContent = "We offer a wide range of mental wellness services including:\n\n• Individual Therapy - One-on-one sessions for anxiety, depression, trauma, and more\n• Couple Therapy - Strengthen your relationships\n• Group Therapy - Connect with others facing similar challenges\n• Holistic Coaching - Mind, body, and soul wellness\n\nYou can explore all our services at the3tree.com/services or book a session directly!";
      } else if (query.includes("shraddha") || query.includes("founder") || query.includes("about")) {
        fallbackContent = "Shraddha Gurung is our Founder and Clinical Psychologist. Her journey into psychology began from childhood curiosity about human behavior. She specializes in anxiety, depression, stress, trauma, and relationships. She speaks English, Hindi, and Nepali.\n\nLearn more about her story at the3tree.com/our-story";
      } else if (query.includes("book") || query.includes("appointment") || query.includes("session")) {
        fallbackContent = "Booking a session is easy! You can:\n\n1. Click 'Book a Session' on our homepage\n2. Visit the3tree.com/booking\n3. Contact us directly at hello@the3tree.com\n\nWe're here to help you feel seen, heard, and understood. 💚";
      } else if (query.includes("price") || query.includes("cost") || query.includes("fee")) {
        fallbackContent = "For pricing information and session details, please visit our Services page or contact us directly at hello@the3tree.com. We offer various therapy options to suit your needs.";
      } else if (query.includes("help") || query.includes("support")) {
        fallbackContent = "We're here to support your mental wellness journey. The 3 Tree offers professional therapy for anxiety, depression, stress, trauma, relationships, and more.\n\nYou can:\n• Book a therapy session\n• Take a mental health assessment\n• Speak with someone immediately\n• Explore our resources\n\nContact us at hello@the3tree.com or call our support line.";
      } else {
        fallbackContent += "However, I can still help! Here are some ways:\n\n• Visit the3tree.com to explore our services\n• Book a session at the3tree.com/booking\n• Email us at hello@the3tree.com\n• Call our support line\n\nWhat would you like to know about our therapy services?";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickPrompt = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Custom Animation Styles */}
      <style>{`
        @keyframes chatbot-bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes chatbot-pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-message-appear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatbot-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes chatbot-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(22, 26, 48, 0.3); }
          50% { box-shadow: 0 0 30px rgba(22, 26, 48, 0.5); }
        }
        .chatbot-toggle-btn {
          animation: chatbot-glow 3s ease-in-out infinite;
        }
        .chatbot-toggle-btn:hover {
          animation: chatbot-bounce-subtle 0.4s ease-in-out;
        }
        .chatbot-pulse-ring {
          animation: chatbot-pulse-ring 2s ease-out infinite;
        }
        .chatbot-window-appear {
          animation: chatbot-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chatbot-message-item {
          animation: chatbot-message-appear 0.3s ease-out forwards;
        }
        .chatbot-typing-dot {
          animation: chatbot-typing-dot 1.4s ease-in-out infinite;
        }
        .chatbot-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .chatbot-typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* Chat Toggle Button - Fixed Position - Always visible when chat is closed */}
      {!isOpen && (
        <div 
          id="chatbot-toggle-container"
          style={{ 
            position: 'fixed', 
            bottom: '24px', 
            right: '24px', 
            zIndex: 99999,
            pointerEvents: 'auto'
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="chatbot-toggle-btn w-16 h-16 rounded-full bg-gradient-to-br from-[#161A30] to-[#2d3a54] text-white shadow-2xl flex items-center justify-center group transition-all duration-300 hover:scale-110 relative"
            aria-label="Open chat with The 3 Tree"
          >
            <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />
            {/* Animated pulse ring */}
            <span className="chatbot-pulse-ring absolute inset-0 rounded-full bg-[#161A30]" />
            {/* Status indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "chatbot-window-appear bg-white rounded-2xl shadow-2xl shadow-black/15 overflow-hidden flex flex-col border border-gray-100",
            isMinimized ? "h-auto" : "h-[600px] max-h-[calc(100vh-48px)]"
          )}
          style={{ 
            position: 'fixed', 
            bottom: '24px', 
            right: '24px', 
            zIndex: 99999,
            width: '400px',
            maxWidth: 'calc(100vw - 48px)'
          }}
        >
          {/* Header - Premium Gradient */}
          <div className="bg-gradient-to-r from-[#161A30] via-[#1e2440] to-[#2d3a54] text-white p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  The 3 Tree
                  <span className="px-2 py-0.5 bg-white/15 rounded-full text-[10px] font-medium tracking-wide">AI</span>
                </h3>
                <p className="text-xs text-white/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" />
                  Your Wellness Companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all duration-200"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all duration-200"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content - Only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 via-white to-white">
                {/* Welcome Message */}
                {showWelcome && messages.length === 0 && (
                  <div className="space-y-4">
                    {/* Welcome card */}
                    <div className="chatbot-message-item bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 relative overflow-hidden">
                      {/* Subtle decorative gradient */}
                      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#161A30]/5 to-transparent rounded-bl-full" />
                      
                      <div className="flex items-start gap-3 relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] flex items-center justify-center shrink-0 shadow-lg shadow-[#161A30]/25">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            Hi there! 👋 Welcome to <strong className="text-[#161A30]">The 3 Tree</strong>! I'm your AI wellness companion, 
                            here to help you learn about our therapy services, answer your questions, 
                            or simply be a supportive presence on your mental wellness journey.
                          </p>
                          <p className="text-gray-500 text-xs mt-3 flex items-center gap-1.5">
                            <Heart className="w-3 h-3 text-rose-400" />
                            How can I support you today?
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Prompts Grid */}
                    <div className="space-y-2.5">
                      <p className="text-[11px] text-gray-400 font-medium px-1 uppercase tracking-wider">Quick questions</p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickPrompts.map((prompt, index) => (
                          <button
                            key={prompt.text}
                            onClick={() => handleQuickPrompt(prompt.text)}
                            className="chatbot-message-item flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#161A30]/20 hover:shadow-md hover:shadow-[#161A30]/5 transition-all duration-200 text-left group"
                            style={{ animationDelay: `${index * 0.08}s` }}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200",
                              prompt.bg,
                              prompt.hoverBg
                            )}>
                              <prompt.icon className={cn("w-4 h-4", prompt.color)} />
                            </div>
                            <span className="text-xs text-gray-600 group-hover:text-gray-900 line-clamp-2 leading-snug font-medium">
                              {prompt.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "chatbot-message-item flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] flex items-center justify-center shrink-0 shadow-md shadow-[#161A30]/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-gradient-to-br from-[#161A30] to-[#2d3a54] text-white rounded-br-md shadow-md shadow-[#161A30]/20"
                          : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-2 flex items-center gap-1",
                          message.role === "user" ? "text-white/50 justify-end" : "text-gray-400"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="chatbot-message-item flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] flex items-center justify-center shrink-0 shadow-md shadow-[#161A30]/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <span className="chatbot-typing-dot w-2 h-2 bg-[#161A30] rounded-full"></span>
                          <span className="chatbot-typing-dot w-2 h-2 bg-[#161A30] rounded-full"></span>
                          <span className="chatbot-typing-dot w-2 h-2 bg-[#161A30] rounded-full"></span>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-100 bg-white shrink-0"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#161A30]/20 focus:border-[#161A30]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] hover:from-[#1f2640] hover:to-[#3d4a64] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#161A30]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#161A30]/30 hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-300" />
                  AI support only, not medical advice. For emergencies, contact local services.
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
