import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Phone, MessageCircle, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoCallRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        // Initialize local video stream
        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing media devices:", err);
            }
        };

        initMedia();

        // Call timer
        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
            // Clean up media streams
            if (localVideoRef.current?.srcObject) {
                const stream = localVideoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => {
                track.enabled = isVideoOff;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const endCall = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        navigate("/dashboard");
    };

    return (
        <>
            <Helmet>
                <title>Video Session | 3-3.com Counseling</title>
            </Helmet>
            <div className="min-h-screen bg-gray-900 flex">
                {/* Main Video Area */}
                <div className={`flex-1 flex flex-col ${showChat ? 'lg:mr-80' : ''} transition-all`}>
                    {/* Header */}
                    <header className="bg-gray-800/50 backdrop-blur-sm p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Session with Dr. Sarah Johnson</p>
                                <p className="text-sm text-gray-400">Individual Therapy</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-gray-700 rounded-lg text-white font-mono">
                                {formatDuration(callDuration)}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowChat(!showChat)}
                                className="text-gray-400 hover:text-white hover:bg-gray-700"
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
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-3xl font-serif text-white">DJ</span>
                                    </div>
                                    <p className="text-white font-medium">Dr. Sarah Johnson</p>
                                    <p className="text-gray-400 text-sm">Connecting...</p>
                                </div>
                            </div>
                        </div>

                        {/* Local Video (Picture-in-Picture) */}
                        <div className="absolute bottom-8 right-8 w-48 h-36 rounded-xl overflow-hidden bg-gray-800 shadow-2xl border-2 border-gray-700">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror"
                            />
                            {isVideoOff && (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <VideoOff className="w-8 h-8 text-gray-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-6 flex items-center justify-center gap-4">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={toggleMute}
                            className={`w-14 h-14 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                                } text-white`}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                                } text-white`}
                        >
                            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={endCall}
                            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Phone className="w-6 h-6 rotate-[135deg]" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
                        >
                            <Settings className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Chat Sidebar */}
                {showChat && (
                    <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="font-semibold text-white">Session Chat</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="text-center text-gray-500 text-sm py-8">
                                No messages yet. Start the conversation!
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
                                />
                                <Button className="btn-icy">Send</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
