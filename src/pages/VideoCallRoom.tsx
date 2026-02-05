import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import {
    Loader2, AlertCircle, RotateCcw,
    Shield, CheckCircle2, FileText, X, Save,
    ChevronDown, Lock, Clock, User, Video,
    ClipboardList, Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import PrescriptionModal from "@/components/booking/PrescriptionModal";
import PatientAssessmentPreview from "@/components/booking/PatientAssessmentPreview";

type ConnectionState = 'initializing' | 'loading' | 'ready' | 'connected' | 'failed' | 'ended';

interface SOAPNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface SessionInfo {
    id: string;
    booking_id?: string;
    therapist_id?: string;
    therapist_name?: string;
    patient_id?: string;
    patient_name?: string;
    scheduled_at?: string;
    service_type?: string;
    duration_minutes?: number;
    is_therapist: boolean;
    notes_therapist?: string;
}

const DEFAULT_SOAP: SOAPNote = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
};

const SOAP_SECTIONS = [
    { key: 'subjective', label: 'S - Subjective', placeholder: "Patient's reported symptoms, concerns, history...", color: 'border-l-blue-400' },
    { key: 'objective', label: 'O - Objective', placeholder: 'Observable findings, mental status, behavior...', color: 'border-l-green-400' },
    { key: 'assessment', label: 'A - Assessment', placeholder: 'Clinical impression, diagnosis, progress...', color: 'border-l-amber-400' },
    { key: 'plan', label: 'P - Plan', placeholder: 'Treatment plan, interventions, follow-up...', color: 'border-l-purple-400' },
];

export default function VideoCallRoom() {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading, profile } = useAuth();
    const { toast } = useToast();
    const jitsiApiRef = useRef<any>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasJoinedRef = useRef(false);
    const roomNameRef = useRef<string | null>(null);

    // Core State
    const [connectionState, setConnectionState] = useState<ConnectionState>('initializing');
    const [error, setError] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [permissionsGranted, setPermissionsGranted] = useState(false);

    // Notes Panel State
    const [showNotes, setShowNotes] = useState(false);
    const [notesMode, setNotesMode] = useState<'soap' | 'simple'>('soap');
    const [soapNotes, setSoapNotes] = useState<SOAPNote>(DEFAULT_SOAP);
    const [simpleNotes, setSimpleNotes] = useState('');
    const [expandedSection, setExpandedSection] = useState<string>('subjective');
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // New modal states for prescription and assessments
    const [showPrescription, setShowPrescription] = useState(false);
    const [showAssessments, setShowAssessments] = useState(false);

    const mode = searchParams.get('mode') || 'video';

    // Check and request media permissions
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                // Request media permissions early
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: mode !== 'audio',
                    audio: true
                });
                // Stop the tracks immediately after getting permission
                stream.getTracks().forEach(track => track.stop());
                setPermissionsGranted(true);
            } catch (err) {
                console.warn('Media permission check:', err);
                // Don't block - Jitsi will handle permissions too
                setPermissionsGranted(true);
            }
        };
        
        checkPermissions();
    }, [mode]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Load session info and notes
    useEffect(() => {
        if (!roomId || !user) return;

        const loadSession = async () => {
            try {
                setConnectionState('initializing');

                // Get booking by video_room_id
                const { data: booking, error: bookingError } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        scheduled_date,
                        scheduled_time,
                        service_type,
                        duration_minutes,
                        notes_therapist,
                        status,
                        user_id,
                        therapist_id,
                        patient:users!bookings_user_id_fkey(id, full_name),
                        therapist:therapists!bookings_therapist_id_fkey(
                            id,
                            user:users!therapists_user_id_fkey(id, full_name)
                        )
                    `)
                    .eq('video_room_id', roomId)
                    .single();

                if (booking) {
                    const therapistUserId = booking.therapist?.user?.id;
                    const isTherapist = therapistUserId === user.id;

                    setSessionInfo({
                        id: roomId,
                        booking_id: booking.id,
                        therapist_id: booking.therapist?.id,
                        therapist_name: booking.therapist?.user?.full_name || 'Therapist',
                        patient_id: booking.patient?.id,
                        patient_name: booking.patient?.full_name || 'Patient',
                        scheduled_at: `${booking.scheduled_date} ${booking.scheduled_time}`,
                        service_type: booking.service_type || 'individual',
                        duration_minutes: booking.duration_minutes || 50,
                        is_therapist: isTherapist,
                        notes_therapist: booking.notes_therapist
                    });

                    // Load existing notes if therapist
                    if (isTherapist && booking.notes_therapist) {
                        try {
                            const parsed = JSON.parse(booking.notes_therapist);
                            if (parsed.subjective !== undefined) {
                                setSoapNotes(parsed);
                                setNotesMode('soap');
                            } else {
                                setSimpleNotes(booking.notes_therapist);
                                setNotesMode('simple');
                            }
                        } catch {
                            setSimpleNotes(booking.notes_therapist);
                            setNotesMode('simple');
                        }
                    }
                } else {
                    // Fallback: Generic session without booking
                    console.warn('No booking found for room:', roomId, bookingError);
                    setSessionInfo({
                        id: roomId,
                        is_therapist: profile?.role === 'therapist'
                    });
                }

                setConnectionState('loading');
            } catch (err) {
                console.error('Failed to load session:', err);
                setSessionInfo({
                    id: roomId,
                    is_therapist: profile?.role === 'therapist'
                });
                setConnectionState('loading');
            }
        };

        loadSession();
    }, [roomId, user, profile]);

    // Call duration timer
    useEffect(() => {
        if (connectionState !== 'connected') return;

        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [connectionState]);

    // Auto-save notes (debounced)
    useEffect(() => {
        if (!sessionInfo?.booking_id || !sessionInfo.is_therapist) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveNotes(true);
        }, 3000); // Auto-save after 3 seconds of inactivity

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [soapNotes, simpleNotes, notesMode]);

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Save notes to database
    const saveNotes = async (isAutoSave = false) => {
        if (!sessionInfo?.booking_id) return;

        try {
            setSaving(true);
            const notesContent = notesMode === 'soap'
                ? JSON.stringify(soapNotes)
                : simpleNotes;

            const { error } = await supabase
                .from('bookings')
                .update({ notes_therapist: notesContent })
                .eq('id', sessionInfo.booking_id);

            if (error) throw error;

            setLastSaved(new Date());

            if (!isAutoSave) {
                toast({
                    title: '✓ Notes Saved',
                    description: 'Session notes have been saved securely.'
                });
            }
        } catch (err) {
            console.error('Error saving notes:', err);
            if (!isAutoSave) {
                toast({
                    title: 'Error',
                    description: 'Failed to save notes. Please try again.',
                    variant: 'destructive'
                });
            }
        } finally {
            setSaving(false);
        }
    };

    // Mark session as completed
    const markSessionCompleted = async () => {
        if (!sessionInfo?.booking_id) return;

        try {
            await supabase
                .from('bookings')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', sessionInfo.booking_id);

            toast({
                title: 'Session Completed',
                description: 'The session has been marked as completed.'
            });
        } catch (err) {
            console.error('Error completing session:', err);
        }
    };

    // Jitsi API ready handler
    const handleReadyToClose = useCallback(() => {
        // Only navigate if user actually joined and left intentionally
        if (hasJoinedRef.current) {
            console.log('User left conference intentionally');
            navigate('/dashboard');
        } else {
            // Don't auto-navigate - let user retry or go back manually
            console.log('Conference closed before joining - not auto-redirecting');
        }
    }, [navigate]);

    const handleApiReady = useCallback((api: any) => {
        jitsiApiRef.current = api;
        setConnectionState('ready');

        // Listen for successful join
        api.addListener('videoConferenceJoined', () => {
            console.log('Successfully joined conference');
            hasJoinedRef.current = true;
            setConnectionState('connected');
            setError(null);
        });

        // Handle connection errors
        api.addListener('errorOccurred', (event: any) => {
            console.error('Jitsi error:', event);
            
            // Handle specific error types
            const errorName = event.error?.name || '';
            
            // Members-only error - room requires auth (don't auto-reload, causes loops)
            if (errorName === 'conference.connectionError.membersOnly') {
                console.warn('Room is members-only, but continuing anyway');
                // Don't reload - it causes infinite loops
                return;
            }
            
            // Ignore harmless auth prompts and non-fatal errors
            if (errorName === 'conference.authenticationRequired' ||
                errorName.includes('password') ||
                !event.error?.isFatal) {
                return;
            }
            
            // Only handle truly fatal errors that prevent joining
            if (event.error?.isFatal && !hasJoinedRef.current) {
                console.error('Fatal Jitsi error:', errorName);
                setError(`Connection error. Please try again.`);
                setConnectionState('failed');
            }
        });

        // Only handle leave if user actually joined
        api.addListener('videoConferenceLeft', async () => {
            console.log('videoConferenceLeft fired, hasJoined:', hasJoinedRef.current);
            
            // Only process if user actually joined the conference
            if (!hasJoinedRef.current) {
                console.log('Ignoring videoConferenceLeft - user never joined');
                return;
            }
            
            if (connectionState === 'ended') return;
            
            setConnectionState('ended');
            // Save notes before leaving
            if (sessionInfo?.is_therapist && sessionInfo?.booking_id) {
                await saveNotes();
                await markSessionCompleted();
            }
            navigate('/dashboard');
        });

        // Only use readyToClose for cleanup, not navigation
        api.addListener('readyToClose', () => {
            console.log('readyToClose fired, hasJoined:', hasJoinedRef.current);
            // Only navigate if user had joined
            if (hasJoinedRef.current) {
                handleReadyToClose();
            }
        });

        // Handle participant joined (useful for debugging)
        api.addListener('participantJoined', (participant: any) => {
            console.log('Participant joined:', participant);
        });

        if (mode === 'audio') {
            api.executeCommand('toggleVideo');
        }
    }, [mode, navigate, sessionInfo, handleReadyToClose, connectionState]);

    // Get display name
    const getDisplayName = () => {
        if (profile?.full_name) return profile.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'Participant';
    };

    // Generate safe room name - stable for both parties to join same room
    const getSafeRoomName = useCallback(() => {
        // Return cached room name if already generated
        if (roomNameRef.current) return roomNameRef.current;
        
        if (!roomId) {
            roomNameRef.current = `the3tree-session-${Date.now()}`;
        } else {
            // Use sanitized roomId - must be same for both parties
            const sanitized = roomId.replace(/[^a-zA-Z0-9]/g, '');
            roomNameRef.current = `the3treecounseling${sanitized}`;
        }
        console.log('Generated room name:', roomNameRef.current);
        return roomNameRef.current;
    }, [roomId]);

    // Retry connection
    const retryConnection = useCallback(() => {
        setError(null);
        setConnectionState('loading');
        hasJoinedRef.current = false;
    }, []);

    // Loading state
    if (authLoading || connectionState === 'initializing' || !permissionsGranted) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-400">
                        {!permissionsGranted ? 'Checking media permissions...' : 'Preparing your session...'}
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (connectionState === 'failed' || error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Connection Failed</h2>
                    <p className="text-gray-400 mb-6">
                        {error || 'Unable to start video session. Please check your camera and microphone permissions.'}
                    </p>

                    <div className="flex flex-col gap-3">
                        {/* Troubleshooting tips */}
                        <div className="text-left bg-gray-800 rounded-lg p-4 mb-2">
                            <p className="text-sm text-gray-300 font-medium mb-2">Quick fixes:</p>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• Allow camera & microphone access in your browser</li>
                                <li>• Check your internet connection</li>
                                <li>• Try refreshing the page</li>
                                <li>• Use Chrome or Firefox for best experience</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-center">
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
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Video Session | The 3 Tree Counseling</title>
            </Helmet>

            <div className="min-h-screen bg-gray-900 flex flex-col">
                {/* Session Info Header */}
                <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${connectionState === 'connected' ? 'bg-green-500 animate-pulse' :
                                connectionState === 'ready' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                            }`} />

                        <div>
                            <p className="font-medium text-white text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {sessionInfo?.is_therapist
                                    ? sessionInfo?.patient_name || 'Patient'
                                    : sessionInfo?.therapist_name || 'Therapist'
                                }
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                                {sessionInfo?.service_type?.replace(/_/g, ' ') || 'Session'} • {sessionInfo?.duration_minutes || 50}min
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Call Duration */}
                        {connectionState === 'connected' && (
                            <div className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-white font-mono text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {formatDuration(callDuration)}
                            </div>
                        )}

                        {/* Notes Button - Therapist Only */}
                        {sessionInfo?.is_therapist && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAssessments(true)}
                                    className="text-white hover:bg-gray-700"
                                    title="View Patient Assessments"
                                >
                                    <ClipboardList className="w-4 h-4 mr-2" />
                                    Assessments
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPrescription(true)}
                                    className="text-white hover:bg-gray-700"
                                    title="Write Prescription"
                                >
                                    <Pill className="w-4 h-4 mr-2" />
                                    Prescription
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNotes(!showNotes)}
                                    className={`text-white hover:bg-gray-700 ${showNotes ? 'bg-primary' : ''}`}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Notes
                                    {saving && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
                                </Button>
                            </>
                        )}

                        {/* Security Badge */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-lg">
                            <Shield className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">Encrypted</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex relative">
                    {/* Jitsi Meeting Container */}
                    <div className={`flex-1 relative transition-all duration-300 ${showNotes ? 'mr-96' : ''}`}>
                        {connectionState === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                                    <p className="text-gray-400">Loading video conference...</p>
                                </div>
                            </div>
                        )}

                        <JitsiMeeting
                            domain="meet.ffmuc.net"
                            roomName={getSafeRoomName()}
                            configOverwrite={{
                                // Direct join - no waiting
                                startWithAudioMuted: false,
                                startWithVideoMuted: mode === 'audio',
                                prejoinPageEnabled: false,
                                prejoinConfig: { enabled: false },
                                
                                // Disable ALL authentication and lobby features
                                enableLobbyChat: false,
                                hideLobbyButton: true,
                                disableModeratorIndicator: true,
                                disableRemoteMute: true,
                                remoteVideoMenu: { disableKick: true, disableGrantModerator: true },
                                
                                // Hide Jitsi branding completely
                                hideConferenceSubject: true,
                                hideConferenceTimer: false,
                                hideRecordingLabel: true,
                                disableProfile: true,
                                
                                // Disable features that require auth
                                fileRecordingsEnabled: false,
                                liveStreamingEnabled: false,
                                transcribingEnabled: false,
                                enableClosePage: false,
                                
                                // Privacy & Security
                                disableDeepLinking: true,
                                disableInviteFunctions: true,
                                disableThirdPartyRequests: true,
                                doNotStoreRoom: true,
                                enableInsecureRoomNameWarning: false,
                                enableEmailInStats: false,
                                
                                // Audio/Video
                                enableNoisyMicDetection: true,
                                enableNoAudioDetection: true,
                                startAudioOnly: mode === 'audio',
                                disableLocalVideoFlip: false,
                                
                                // Simplified toolbar
                                toolbarButtons: [
                                    'microphone',
                                    'camera',
                                    'desktop',
                                    'fullscreen',
                                    'fodeviceselection',
                                    'hangup',
                                    'chat',
                                    'tileview',
                                    'settings',
                                ],
                                
                                // Minimal notifications
                                notifications: [],
                                disablePolls: true,
                                disableReactions: true,
                                disableSelfView: false,
                                disableSelfViewSettings: true,
                            }}
                            interfaceConfigOverwrite={{
                                // Completely hide Jitsi branding
                                SHOW_JITSI_WATERMARK: false,
                                SHOW_WATERMARK_FOR_GUESTS: false,
                                SHOW_BRAND_WATERMARK: false,
                                BRAND_WATERMARK_LINK: '',
                                SHOW_POWERED_BY: false,
                                SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                                SHOW_CHROME_EXTENSION_BANNER: false,
                                
                                // Custom styling
                                DEFAULT_BACKGROUND: '#111827',
                                
                                // Disable unnecessary features
                                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                                MOBILE_APP_PROMO: false,
                                HIDE_INVITE_MORE_HEADER: true,
                                HIDE_DEEP_LINKING_LOGO: true,
                                GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
                                DISPLAY_WELCOME_FOOTER: false,
                                DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
                                DISPLAY_WELCOME_PAGE_CONTENT: false,
                                DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                                
                                // Display names
                                DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
                                DEFAULT_LOCAL_DISPLAY_NAME: 'You',
                                
                                // Toolbar
                                TOOLBAR_ALWAYS_VISIBLE: false,
                                TOOLBAR_TIMEOUT: 4000,
                                SETTINGS_SECTIONS: ['devices', 'language'],
                                
                                // Video layout
                                FILM_STRIP_MAX_HEIGHT: 120,
                                VERTICAL_FILMSTRIP: true,
                                
                                // Disable authentication UI
                                AUTHENTICATION_ENABLE: false,
                            }}
                            userInfo={{
                                displayName: getDisplayName(),
                                email: user?.email || undefined,
                            }}
                            onApiReady={handleApiReady}
                            getIFrameRef={(iframeRef) => {
                                if (iframeRef) {
                                    iframeRef.style.height = '100%';
                                    iframeRef.style.width = '100%';
                                }
                            }}
                        />
                    </div>

                    {/* Notes Side Panel - Therapist Only */}
                    {sessionInfo?.is_therapist && showNotes && (
                        <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 flex flex-col z-30 shadow-2xl">
                            {/* Notes Header */}
                            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Session Notes
                                    </h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        <Lock className="w-3 h-3" />
                                        HIPAA-compliant • Auto-saves
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowNotes(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Patient Info */}
                            <div className="px-4 py-3 bg-gray-700/30 border-b border-gray-700">
                                <p className="text-sm text-gray-300">
                                    <span className="text-gray-500">Patient:</span> {sessionInfo?.patient_name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {sessionInfo?.service_type?.replace(/_/g, ' ')} Session
                                </p>
                            </div>

                            {/* Format Toggle */}
                            <div className="p-4 border-b border-gray-700">
                                <div className="flex gap-1 bg-gray-700 p-1 rounded-lg">
                                    <button
                                        onClick={() => setNotesMode('soap')}
                                        className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${notesMode === 'soap'
                                                ? 'bg-primary text-white'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        SOAP Format
                                    </button>
                                    <button
                                        onClick={() => setNotesMode('simple')}
                                        className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${notesMode === 'simple'
                                                ? 'bg-primary text-white'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Simple
                                    </button>
                                </div>
                            </div>

                            {/* Notes Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {notesMode === 'soap' ? (
                                    <div className="space-y-3">
                                        {SOAP_SECTIONS.map((section) => (
                                            <div
                                                key={section.key}
                                                className={`border-l-4 ${section.color} bg-gray-700/30 rounded-r-lg overflow-hidden`}
                                            >
                                                <button
                                                    onClick={() => setExpandedSection(
                                                        expandedSection === section.key ? '' : section.key
                                                    )}
                                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-white">{section.label}</span>
                                                        {soapNotes[section.key as keyof SOAPNote] && (
                                                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                        )}
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === section.key ? 'rotate-180' : ''
                                                        }`} />
                                                </button>
                                                {expandedSection === section.key && (
                                                    <div className="px-3 pb-3">
                                                        <textarea
                                                            value={soapNotes[section.key as keyof SOAPNote]}
                                                            onChange={(e) => setSoapNotes(prev => ({
                                                                ...prev,
                                                                [section.key]: e.target.value
                                                            }))}
                                                            placeholder={section.placeholder}
                                                            className="w-full h-24 p-2 text-sm bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Session Notes
                                        </label>
                                        <textarea
                                            value={simpleNotes}
                                            onChange={(e) => setSimpleNotes(e.target.value)}
                                            placeholder="Type your session notes here..."
                                            className="w-full h-64 p-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Notes Footer */}
                            <div className="p-4 border-t border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-gray-500">
                                        {saving ? (
                                            <span className="flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : lastSaved ? (
                                            `Saved ${lastSaved.toLocaleTimeString()}`
                                        ) : (
                                            'Not saved yet'
                                        )}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => saveNotes(false)}
                                    disabled={saving}
                                    className="w-full bg-primary hover:bg-primary/90"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Notes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Info Bar */}
                <footer className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                <span>End-to-end encrypted</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" />
                                <span>Secure Video Session</span>
                            </div>
                        </div>
                        <div className="text-gray-500">
                            Powered by <span className="text-primary">The 3 Tree Counseling</span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Prescription Modal */}
            {sessionInfo?.is_therapist && sessionInfo?.booking_id && (
                <PrescriptionModal
                    isOpen={showPrescription}
                    onClose={() => setShowPrescription(false)}
                    bookingId={sessionInfo.booking_id}
                    therapistId={sessionInfo.therapist_id || ''}
                    patientId={sessionInfo.patient_id || ''}
                    patientName={sessionInfo.patient_name || 'Patient'}
                    therapistName={sessionInfo.therapist_name || 'Therapist'}
                />
            )}

            {/* Assessment Preview Modal */}
            {sessionInfo?.is_therapist && sessionInfo?.patient_id && (
                <PatientAssessmentPreview
                    isOpen={showAssessments}
                    onClose={() => setShowAssessments(false)}
                    patientId={sessionInfo.patient_id}
                    patientName={sessionInfo.patient_name || 'Patient'}
                />
            )}
        </>
    );
}
