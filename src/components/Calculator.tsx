'use client'

import Draggable from 'react-draggable'
import { useState, useRef, ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import BackspaceIcon from '@mui/icons-material/Backspace'
import AddIcon from '@mui/icons-material/Add';
import MinimizeIcon from '@mui/icons-material/Minimize';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';


export default function Calculator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [display, setDisplay] = useState('0')
    const nodeRef = useRef(null)

    if (!isOpen) return null

    const handleClick = (value: string) => {
        const operators = ['/', '*', '-', '+']

        if (value === '.') {
            const parts = display.split(/[\+\-\*\/]/)
            const currentPart = parts[parts.length - 1]
            if (currentPart.includes('.')) return
            setDisplay(display + value)
            return
        }

        // If it's an operator
        if (operators.includes(value)) {
            if (display === 'Error') {
                setDisplay('0' + value)
                return
            }

            const lastChar = display.slice(-1)
            if (operators.includes(lastChar) || lastChar === '.') {
                // Replace the operator (or invalid trailing dot)
                setDisplay(display.slice(0, -1) + value)
            } else {
                setDisplay(display + value)
            }
            return
        }

        // If it's a number
        if (display === '0' || display === 'Error') {
            setDisplay(value)
        } else {
            setDisplay(display + value)
        }
    }

    const handleDelete = () => {
        if (display.length === 1 || display === 'Error') {
            setDisplay('0')
        } else {
            setDisplay(display.slice(0, -1))
        }
    }

    const calculate = () => {
        try {
            setDisplay(eval(display).toString())
        } catch {
            setDisplay('Error')
        }
    }

    const clear = () => setDisplay('0')

    return (
        <Draggable handle=".drag-handle" nodeRef={nodeRef}>
            <div ref={nodeRef} className="fixed top-24 left-24 z-50 w-72 rounded-xl bg-white shadow-xl border border-slate-300">

                {/* Header (drag handle) */}
                <div className="drag-handle flex items-center justify-between px-4 py-2 cursor-move bg-gray-100 rounded-t-xl">
                    <span className="font-semibold text-sm flex items-center gap-2"><DragIndicatorIcon fontSize="small" /> Calculadora</span>
                    <button onClick={onClose} className='cursor-pointer'>
                        <CloseIcon fontSize="small" />
                    </button>
                </div>

                {/* Display */}
                <div className="p-4 text-right text-3xl font-bold">
                    {display}
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-4 gap-2 p-4">
                    <Button label="C" onClick={clear} className='border border-slate-300 text-red-500 hover:bg-gray-200' />
                    <Button label={<BackspaceIcon fontSize="small" />} className='border border-slate-300 hover:bg-gray-200' onClick={handleDelete} />
                    <Button label="/" onClick={() => handleClick('/')} className='border border-slate-300 hover:bg-gray-200' />
                    <Button label={<CloseIcon fontSize="small" />} onClick={() => handleClick('*')} className='border border-slate-300 hover:bg-gray-200' />

                    {[7, 8, 9].map(n => <Button key={n} label={n} onClick={() => handleClick(n.toString())} className='border border-slate-300 hover:bg-gray-200' />)}
                    <Button label={<MinimizeIcon fontSize="small" />} onClick={() => handleClick('-')} className='border border-slate-300 hover:bg-gray-200' />

                    {[4, 5, 6].map(n => <Button key={n} label={n} onClick={() => handleClick(n.toString())} className='border border-slate-300 hover:bg-gray-200' />)}
                    <Button label={<AddIcon fontSize="small" />} onClick={() => handleClick('+')} className='border border-slate-300 hover:bg-gray-200' />

                    {[1, 2, 3].map(n => <Button key={n} label={n} onClick={() => handleClick(n.toString())} className='border border-slate-300 hover:bg-gray-200' />)}
                    <Button label="=" onClick={calculate} className="row-span-1 bg-slate-900 text-white font-bold hover:bg-slate-800" />

                    <Button label="0" onClick={() => handleClick('0')} className="col-span-3 border border-slate-300 hover:bg-gray-200" />
                    <Button label="." onClick={() => handleClick('.')} className='border col-span-1 border-slate-300 hover:bg-gray-200' />
                </div>
            </div>
        </Draggable>
    )
}

function Button({
    label,
    onClick,
    className = '',
}: {
    label: ReactNode
    onClick: () => void
    className?: string
}) {
    return (
        <button
            onClick={onClick}
            className={`h-12 rounded-lg font-semibold cursor-pointer ${className}`}
        >
            {label}
        </button>
    )
}
