import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import {
    Mic, MicOff, Video, VideoOff, Phone, MessageCircle,
    Settings, Monitor, MonitorOff, Loader2, AlertCircle,
    PhoneOff, RotateCcw, Volume2, VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { WebRTCService, createVideoSession } from "@/lib/services/webrtcService";
import { supabase } from "@/lib/supabase";

type ConnectionState = 'initializing' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'ended';

export default function VideoCallRoom() {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const webrtcRef = useRef<WebRTCService | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // State
    const [connectionState, setConnectionState] = useState<ConnectionState>('initializing');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ sender: string; content: string; time: string }[]>([]);
    const [newChatMessage, setNewChatMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [otherUser, setOtherUser] = useState<{ name: string; avatar?: string } | null>(null);
    const [isInitiator, setIsInitiator] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState<string>('unknown');

    const mode = searchParams.get('mode') || 'video';

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Initialize WebRTC
    useEffect(() => {
        if (!roomId || !user) return;

        const initializeCall = async () => {
            try {
                setConnectionState('initializing');

                // Check if session exists
                const { data: session } = await supabase
                    .from('video_call_sessions')
                    .select('*, initiator:users!video_call_sessions_initiator_id_fkey(full_name, avatar_url), receiver:users!video_call_sessions_receiver_id_fkey(full_name, avatar_url)')
                    .eq('room_id', roomId)
                    .single();

                if (session) {
                    const initiator = session.initiator_id === user.id;
                    setIsInitiator(initiator);
                    setOtherUser(initiator ? {
                        name: session.receiver?.full_name || 'Participant',
                        avatar: session.receiver?.avatar_url
                    } : {
                        name: session.initiator?.full_name || 'Participant',
                        avatar: session.initiator?.avatar_url
                    });
                }

                // Create WebRTC service
                webrtcRef.current = new WebRTCService();

                // Initialize with config
                await webrtcRef.current.initialize({
                    roomId,
                    userId: user.id,
                    isInitiator: session?.initiator_id === user.id || !session,
                    onLocalStream: (stream) => {
                        if (localVideoRef.current) {
                            localVideoRef.current.srcObject = stream;
                        }
                    },
                    onRemoteStream: (stream) => {
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = stream;
                        }
                        setConnectionState('connected');
                    },
                    onConnectionState: (state) => {
                        console.log('Connection state:', state);
                        if (state === 'connected') {
                            setConnectionState('connected');
                        } else if (state === 'disconnected' || state === 'failed') {
                            setConnectionState(state);
                        }
                    },
                    onError: (err) => {
                        console.error('WebRTC error:', err);
                        setError(err.message);
                        setConnectionState('failed');
                    }
                });

                // If video-only mode requested, disable video initially
                if (mode === 'audio') {
                    setIsVideoOff(true);
                    webrtcRef.current.toggleVideo(false);
                }

                setConnectionState('connecting');

                // Start the call if initiator
                if (session?.initiator_id === user.id || !session) {
                    await webrtcRef.current.startCall();
                }

            } catch (err) {
                console.error('Failed to initialize call:', err);
                setError(err instanceof Error ? err.message : 'Failed to start call');
                setConnectionState('failed');
            }
        };

        initializeCall();

        // Cleanup
        return () => {
            if (webrtcRef.current) {
                webrtcRef.current.endCall();
            }
        };
    }, [roomId, user, mode]);

    // Call timer
    useEffect(() => {
        if (connectionState !== 'connected') return;

        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [connectionState]);

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = useCallback(() => {
        if (webrtcRef.current) {
            webrtcRef.current.toggleAudio(isMuted);
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const toggleVideo = useCallback(() => {
        if (webrtcRef.current) {
            webrtcRef.current.toggleVideo(isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    }, [isVideoOff]);

    const toggleScreenShare = useCallback(async () => {
        if (webrtcRef.current) {
            if (isScreenSharing) {
                await webrtcRef.current.stopScreenShare();
                setIsScreenSharing(false);
            } else {
                const success = await webrtcRef.current.startScreenShare();
                setIsScreenSharing(success);
            }
        }
    }, [isScreenSharing]);

    const toggleSpeaker = useCallback(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = !isSpeakerMuted;
            setIsSpeakerMuted(!isSpeakerMuted);
        }
    }, [isSpeakerMuted]);

    // Start quality monitoring when connected
    useEffect(() => {
        if (connectionState === 'connected' && webrtcRef.current) {
            webrtcRef.current.startQualityMonitoring(setConnectionQuality);
        }
        return () => {
            if (webrtcRef.current) {
                webrtcRef.current.stopQualityMonitoring();
            }
        };
    }, [connectionState]);

    const endCall = useCallback(async () => {
        if (webrtcRef.current) {
            await webrtcRef.current.endCall();
        }
        setConnectionState('ended');
        navigate("/dashboard");
    }, [navigate]);

    const retryConnection = useCallback(async () => {
        if (!roomId || !user || !webrtcRef.current) return;

        setConnectionState('connecting');
        setError(null);

        try {
            await webrtcRef.current.startCall();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reconnect');
            setConnectionState('failed');
        }
    }, [roomId, user]);

    const handleSendChatMessage = () => {
        if (!newChatMessage.trim()) return;

        // Add to local messages
        setChatMessages(prev => [...prev, {
            sender: 'me',
            content: newChatMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setNewChatMessage("");
    };

    // Error/Loading states
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    if (connectionState === 'failed' || error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Connection Failed</h2>
                    <p className="text-gray-400 mb-6">{error || 'Unable to establish connection. Please check your camera and microphone permissions.'}</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={retryConnection} className="bg-primary hover:bg-primary/90">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/dashboard')} className="text-white border-gray-600">
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Video Session | The 3 Tree Counseling</title>
            </Helmet>
            <div className="min-h-screen bg-gray-900 flex">
                {/* Main Video Area */}
                <div className={`flex-1 flex flex-col ${showChat ? 'lg:mr-80' : ''} transition-all`}>
                    {/* Header */}
                    <header className="bg-gray-800/50 backdrop-blur-sm p-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${connectionState === 'connected' ? 'bg-green-500' :
                                connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-gray-600'
                                }`}>
                                {connectionState === 'connecting' ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <div className={`w-3 h-3 rounded-full bg-white ${connectionState === 'connected' ? 'animate-pulse' : ''}`} />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-white">
                                    {otherUser?.name || 'Waiting for participant...'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {connectionState === 'connected' ? 'In Session' :
                                        connectionState === 'connecting' ? 'Connecting...' :
                                            'Initializing...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {connectionState === 'connected' && (
                                <>
                                    <div className="px-4 py-2 bg-gray-700 rounded-lg text-white font-mono">
                                        {formatDuration(callDuration)}
                                    </div>
                                    {/* Connection Quality Indicator */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${connectionQuality === 'excellent' ? 'bg-green-500/20 text-green-400' :
                                        connectionQuality === 'good' ? 'bg-blue-500/20 text-blue-400' :
                                            connectionQuality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                                                connectionQuality === 'poor' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-700 text-gray-400'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${connectionQuality === 'excellent' ? 'bg-green-400' :
                                            connectionQuality === 'good' ? 'bg-blue-400' :
                                                connectionQuality === 'fair' ? 'bg-yellow-400' :
                                                    connectionQuality === 'poor' ? 'bg-red-400' :
                                                        'bg-gray-400'
                                            }`} />
                                        {connectionQuality}
                                    </div>
                                    {/* Screen Share Indicator */}
                                    {isScreenSharing && (
                                        <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Monitor className="w-3 h-3" />
                                            Sharing Screen
                                        </div>
                                    )}
                                </>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowChat(!showChat)}
                                className={`text-gray-400 hover:text-white hover:bg-gray-700 ${showChat ? 'bg-gray-700 text-white' : ''}`}
                            >
                                <MessageCircle className="w-5 h-5" />
                            </Button>
                        </div>
                    </header>

                    {/* Video Grid */}
                    <div className="flex-1 p-4 flex items-center justify-center relative">
                        {/* Remote Video (Large) */}
                        <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-gray-800 relative">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            {/* Placeholder when no remote video */}
                            {connectionState !== 'connected' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <div className="text-center">
                                        {otherUser?.avatar ? (
                                            <img
                                                src={otherUser.avatar}
                                                alt={otherUser.name}
                                                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                                <span className="text-3xl font-serif text-white">
                                                    {otherUser?.name?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-white font-medium">{otherUser?.name || 'Waiting...'}</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {connectionState === 'connecting' ? 'Connecting...' : 'Waiting to connect'}
                                        </p>
                                        {connectionState === 'connecting' && (
                                            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mt-4" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Local Video (Picture-in-Picture) */}
                        <div className="absolute bottom-8 right-8 w-48 h-36 rounded-xl overflow-hidden bg-gray-800 shadow-2xl border-2 border-gray-700 group">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            {isVideoOff && (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <VideoOff className="w-8 h-8 text-gray-500" />
                                </div>
                            )}
                            {/* Status indicators */}
                            <div className="absolute bottom-2 left-2 flex gap-1">
                                {isMuted && (
                                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                        <MicOff className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-6 flex items-center justify-center gap-4">
                        {/* Mute */}
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={toggleMute}
                            className={`w-14 h-14 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>

                        {/* Video toggle */}
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </Button>

                        {/* Speaker toggle */}
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={toggleSpeaker}
                            className={`w-14 h-14 rounded-full ${isSpeakerMuted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                            title={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
                        >
                            {isSpeakerMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </Button>

                        {/* Screen Share toggle */}
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={toggleScreenShare}
                            className={`w-14 h-14 rounded-full ${isScreenSharing ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                        >
                            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                        </Button>

                        {/* End Call */}
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={endCall}
                            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            title="End call"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </Button>

                        {/* Settings */}
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
                            title="Settings"
                        >
                            <Settings className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Chat Sidebar */}
                {showChat && (
                    <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 flex flex-col z-20">
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Session Chat</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowChat(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ×
                            </Button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef}>
                            {chatMessages.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-8">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.sender === 'me'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-700 text-gray-200'
                                                }`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newChatMessage}
                                    onChange={(e) => setNewChatMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
                                />
                                <Button onClick={handleSendChatMessage} className="bg-primary hover:bg-primary/90">
                                    Send
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
