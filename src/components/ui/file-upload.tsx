"use client"
// IMPORTANT CHANGE: Replace @tabler/icons-react with lucide-react
import { cn } from "@/lib/utils"
import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"
// Changed: IconUpload from @tabler → Upload from lucide-react
import { useDropzone } from "react-dropzone"

const mainVariant = {
    initial: { x: 0, y: 0 },
    animate: { x: 20, y: -20, opacity: 0.9 },
}

const secondaryVariant = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
}

export const FileUpload = ({
    onChange,
}: {
    onChange?: (files: File[]) => void
}) => {
    const [files, setFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (newFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...newFiles])
        onChange && onChange(newFiles)
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const { getRootProps, isDragActive } = useDropzone({
        multiple: false,
        noClick: true,
        // Accept only PDF and images for lab reports
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        onDrop: handleFileChange,
        onDropRejected: (error) => {
            console.log(error)
        },
    })

    return (
        <div className="w-full" {...getRootProps()}>
            <motion.div
                onClick={handleClick}
                whileHover="animate"
                className="p-8 group/file block rounded-xl cursor-pointer w-full 
                   relative overflow-hidden border-2 border-dashed 
                   border-slate-200 hover:border-sky-400 transition-colors
                   bg-slate-50"
            >
                <input
                    ref={fileInputRef}
                    id="file-upload-handle"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 
                          flex items-center justify-center">
                        <Upload className="w-5 h-5 text-sky-500" />
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">
                            Upload Lab Report
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            PDF, PNG, JPG up to 10MB
                        </p>
                    </div>

                    {files.length > 0 && files.map((file, idx) => (
                        <motion.div
                            key={"file" + idx}
                            layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                            className="w-full bg-white rounded-lg p-3 border border-slate-200
                         flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-sky-50 rounded-md flex items-center 
                                justify-center">
                                    <Upload className="w-4 h-4 text-sky-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 truncate 
                                max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 
                               px-2 py-1 rounded-full">
                                Ready
                            </span>
                        </motion.div>
                    ))}

                    {!files.length && isDragActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sky-500 text-sm font-medium"
                        >
                            Drop your lab report here
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export function GridPattern() {
    // Keep original implementation
    const columns = 41
    const rows = 11
    return (
        <div className="flex bg-slate-50 flex-shrink-0 flex-wrap justify-center 
                    items-center gap-x-px gap-y-px scale-105">
            {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: columns }).map((_, col) => {
                    const index = row * columns + col
                    return (
                        <div
                            key={`${col}-${row}`}
                            className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${index % 2 === 0
                                    ? "bg-slate-50"
                                    : "bg-slate-50 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset]"
                                }`}
                        />
                    )
                })
            )}
        </div>
    )
}
