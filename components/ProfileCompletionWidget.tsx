// Profile Completion Widget Component
// Shows completion percentage and prompts users to complete questionnaire

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { getProfileCompletionStatus, getCompletionMessage, ProfileCompletionStatus } from '../services/profileCompletionService';

interface ProfileCompletionWidgetProps {
    userId: string;
    onStartQuestionnaire: () => void;
}

export const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({ userId, onStartQuestionnaire }) => {
    const [status, setStatus] = useState<ProfileCompletionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatus();
    }, [userId]);

    const loadStatus = async () => {
        setLoading(true);
        const completionStatus = await getProfileCompletionStatus(userId);
        setStatus(completionStatus);
        setLoading(false);
    };

    if (loading || !status) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
            </div>
        );
    }

    const percentage = status.percentage;
    const isComplete = percentage === 100;

    return (
        <div className={`bg-gradient-to-br ${isComplete
                ? 'from-green-50 to-emerald-50 border-green-200'
                : 'from-purple-50 to-blue-50 border-purple-200'
            } rounded-2xl border p-6 shadow-sm`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {isComplete ? 'Profile Complete! 🎉' : 'Complete Your Profile'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {getCompletionMessage(percentage)}
                    </p>
                </div>
                {isComplete ? (
                    <CheckCircle className="text-green-600" size={32} />
                ) : (
                    <AlertCircle className="text-purple-600" size={32} />
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Profile Strength</span>
                    <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Sections Status */}
            {!isComplete && status.missingSections.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Missing sections:</p>
                    <div className="flex flex-wrap gap-2">
                        {status.missingSections.slice(0, 4).map(section => (
                            <span
                                key={section}
                                className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700 capitalize"
                            >
                                {section}
                            </span>
                        ))}
                        {status.missingSections.length > 4 && (
                            <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-500">
                                +{status.missingSections.length - 4} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* CTA Button */}
            {!isComplete && (
                <button
                    onClick={onStartQuestionnaire}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <TrendingUp size={20} />
                    <span>Complete Profile for Perfect Matches</span>
                </button>
            )}

            {isComplete && (
                <div className="text-center py-2">
                    <p className="text-sm font-medium text-green-700">
                        ✨ You're all set! Enjoy intelligent matching!
                    </p>
                </div>
            )}
        </div>
    );
};
