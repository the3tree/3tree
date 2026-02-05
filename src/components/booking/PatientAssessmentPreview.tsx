/**
 * PatientAssessmentPreview - Shows patient assessment results before/during session
 * Helps therapists prepare for sessions by reviewing patient's mental health assessments
 */

import { useState, useEffect } from 'react';
import {
    X, AlertTriangle, ChevronDown, ChevronUp, FileText,
    Clock, TrendingUp, TrendingDown, Minus, Loader2,
    ClipboardList, Brain, Heart, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    getPatientAssessmentSummary,
    PatientAssessmentSummary,
    getRiskLevelColor,
    formatAssessmentName,
    AssessmentSubmission
} from '@/lib/services/assessmentService';

interface PatientAssessmentPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
}

export default function PatientAssessmentPreview({
    isOpen,
    onClose,
    patientId,
    patientName
}: PatientAssessmentPreviewProps) {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<PatientAssessmentSummary | null>(null);
    const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && patientId) {
            loadAssessments();
        }
    }, [isOpen, patientId]);

    const loadAssessments = async () => {
        setLoading(true);
        try {
            const { data, error } = await getPatientAssessmentSummary(patientId);
            if (data) {
                setSummary(data);
            }
        } catch (err) {
            console.error('Error loading assessments:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Assessment Results</h2>
                            <p className="text-sm text-purple-100">Patient: {patientName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    ) : !summary || summary.assessments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardList className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
                            <p className="text-gray-500 text-sm">
                                This patient hasn't completed any assessments yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Risk Level Summary */}
                            <div className={`p-4 rounded-xl border-2 ${getRiskLevelColor(summary.risk_level)}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {summary.risk_level === 'severe' || summary.risk_level === 'high' ? (
                                            <AlertTriangle className="w-6 h-6" />
                                        ) : (
                                            <Brain className="w-6 h-6" />
                                        )}
                                        <div>
                                            <p className="font-semibold capitalize">
                                                {summary.risk_level} Risk Level
                                            </p>
                                            <p className="text-sm opacity-80">
                                                Based on {summary.completed_count} completed assessment{summary.completed_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-80">Latest Severity</p>
                                        <p className="font-medium">{summary.latest_severity}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Assessment List */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                    Assessment History
                                </h3>
                                <div className="space-y-3">
                                    {summary.assessments.map((assessment) => (
                                        <AssessmentCard
                                            key={assessment.id}
                                            assessment={assessment}
                                            isExpanded={expandedAssessment === assessment.id}
                                            onToggle={() => setExpandedAssessment(
                                                expandedAssessment === assessment.id ? null : assessment.id
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Clinical Notes Section */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800">Clinical Considerations</p>
                                        <ul className="mt-2 space-y-1 text-sm text-amber-700">
                                            {summary.risk_level === 'severe' && (
                                                <li>• High-risk indicators present - consider safety assessment</li>
                                            )}
                                            {summary.risk_level === 'high' && (
                                                <li>• Elevated symptoms - monitor closely during session</li>
                                            )}
                                            <li>• Review specific question responses for detailed insights</li>
                                            <li>• Consider discussing assessment results with patient</li>
                                            {summary.assessments.length > 1 && (
                                                <li>• Track symptom progression across assessments</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-end">
                        <Button onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Individual Assessment Card Component
 */
function AssessmentCard({
    assessment,
    isExpanded,
    onToggle
}: {
    assessment: AssessmentSubmission;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const date = new Date(assessment.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const getSeverityBadgeColor = (severity: string) => {
        const s = severity?.toLowerCase() || '';
        if (s.includes('severe') || s.includes('critical')) return 'bg-red-100 text-red-700';
        if (s.includes('high') || s.includes('moderately severe')) return 'bg-orange-100 text-orange-700';
        if (s.includes('moderate')) return 'bg-amber-100 text-amber-700';
        if (s.includes('mild')) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    };

    const getAssessmentIcon = (assessmentId: string) => {
        if (assessmentId.includes('phq') || assessmentId.includes('depression')) {
            return <Heart className="w-4 h-4 text-blue-500" />;
        }
        if (assessmentId.includes('gad') || assessmentId.includes('anxiety')) {
            return <Zap className="w-4 h-4 text-purple-500" />;
        }
        if (assessmentId.includes('stress') || assessmentId.includes('pss')) {
            return <TrendingUp className="w-4 h-4 text-orange-500" />;
        }
        return <Brain className="w-4 h-4 text-cyan-500" />;
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getAssessmentIcon(assessment.assessment_id)}
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-900">
                            {formatAssessmentName(assessment.assessment_id)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{date}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                            {assessment.score}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeColor(assessment.severity)}`}>
                            {assessment.severity}
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                    {/* Interpretation */}
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Interpretation
                        </p>
                        <p className="text-sm text-gray-700">
                            {assessment.interpretation || 'No interpretation available'}
                        </p>
                    </div>

                    {/* Recommendations */}
                    {assessment.recommendations && assessment.recommendations.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Recommendations
                            </p>
                            <ul className="space-y-1">
                                {assessment.recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-cyan-500 mt-1">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Question Responses */}
                    {assessment.answers && Object.keys(assessment.answers).length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Individual Responses
                            </p>
                            <div className="grid grid-cols-9 gap-1">
                                {Object.entries(assessment.answers).slice(0, 9).map(([key, value], index) => {
                                    const numValue = typeof value === 'number' ? value : 0;
                                    const bgColor = numValue >= 3 ? 'bg-red-200' :
                                        numValue >= 2 ? 'bg-amber-200' :
                                            numValue >= 1 ? 'bg-yellow-100' : 'bg-green-100';
                                    return (
                                        <div
                                            key={key}
                                            className={`w-full aspect-square rounded flex items-center justify-center text-xs font-medium ${bgColor}`}
                                            title={`Q${index + 1}: ${value}`}
                                        >
                                            {String(value)}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                0 = Not at all, 3 = Nearly every day
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
