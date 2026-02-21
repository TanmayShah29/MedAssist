"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User, UserPlus, Check, Shield } from "lucide-react";
import { Profile } from "@/types/medical";

interface Props {
    currentProfile: Profile | null;
    profiles: Profile[];
    onProfileSelect: (profile: Profile) => void;
    onAddProfile: () => void;
}

export function ProfileSwitcher({ currentProfile, profiles, onProfileSelect, onAddProfile }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-[#E8E6DF] rounded-full hover:border-sky-200 transition-all shadow-sm group"
            >
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
                    <User size={18} />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-[12px] font-bold text-[#1C1917] leading-none">
                        {currentProfile?.first_name} {currentProfile?.last_name}
                    </p>
                    <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider font-medium mt-0.5">
                        {currentProfile?.parent_id ? "FAMILY PROFILE" : "PRIMARY ACCOUNT"}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#A8A29E] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-64 bg-white border border-[#E8E6DF] rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-[#F1F1EF] bg-[#FAFAF7]">
                                <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest px-2">Switch Profile</p>
                            </div>

                            <div className="p-2 max-h-80 overflow-y-auto">
                                {profiles.map((profile) => (
                                    <button
                                        key={profile.id}
                                        onClick={() => {
                                            onProfileSelect(profile);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${currentProfile?.id === profile.id ? 'bg-sky-50' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentProfile?.id === profile.id ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <User size={16} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-sm font-bold ${currentProfile?.id === profile.id ? 'text-sky-700' : 'text-[#1C1917]'
                                                    }`}>
                                                    {profile.first_name} {profile.last_name}
                                                </p>
                                                <p className="text-[10px] text-[#A8A29E]">
                                                    {profile.parent_id ? "Sub-profile" : "Primary"}
                                                </p>
                                            </div>
                                        </div>
                                        {currentProfile?.id === profile.id && (
                                            <Check className="w-4 h-4 text-sky-600" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-2 border-t border-[#F1F1EF] bg-[#FAFAF7]">
                                <button
                                    onClick={() => {
                                        onAddProfile();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sky-600 font-bold text-sm"
                                >
                                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                                        <UserPlus size={16} />
                                    </div>
                                    Add Family Member
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
