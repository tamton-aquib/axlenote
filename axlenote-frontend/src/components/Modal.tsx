import { type ReactNode } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl ring-1 ring-white/5 p-8 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                    <button onClick={onClose} className="cursor-pointer rounded-full p-2 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
