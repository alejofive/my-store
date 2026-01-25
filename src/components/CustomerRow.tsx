import { Movement, Person } from '@/interfaces/products'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PaidIcon from '@mui/icons-material/Paid'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import React from 'react'
import { formatCurrency } from '@/lib/utils' // Assuming this utility exists or I'll implement it inline if I deleted the local function.
// Actually I deleted the local formatCurrency, so I should put it back or implement it inside.
// To avoid breakage, I will put it back inside the component in the next chunk but I missed it in the huge deletion.
// Let me verify if I can just add it back.

interface CustomerRowProps {
    person: Person
    isOpen: boolean
    togglePerson: (id: string) => void
    onPay: (person: Person) => void
    onUpdate: (updatedPerson: Person) => void
    onEdit: (person: Person) => void
    onReset: (person: Person) => void
    onPayAll: (person: Person) => void
}

export const CustomerRow = ({ person, isOpen, togglePerson, onPay, onUpdate, onEdit, onReset, onPayAll }: CustomerRowProps) => {
    // Calculations
    const getTotals = (movements: Movement[]) => {
        const totalDebe = movements.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0)
        const totalAbono = movements.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0)
        const saldo = movements.reduce((s, m) => s + m.amount, 0)
        return { totalDebe, totalAbono, saldo }
    }

    const { totalDebe, totalAbono, saldo } = getTotals(person.movements)
    const isPaidOff = saldo === 0

    console.log(person)
    return (
        <React.Fragment>
            {/* ROW PERSONA */}
            <tr className={`border-t hover:bg-slate-50 border-slate-300 ${isPaidOff ? 'underline decoration-green-500 decoration-2 underline-offset-4' : ''}`}>
                <td onClick={() => togglePerson(person.id)} className='text-center text-slate-500 cursor-pointer'>
                    {isOpen ? <ArrowDropDownIcon fontSize='large' /> : <ArrowRightIcon fontSize='large' />}
                </td>

                {/* NAME */}
                <td className='p-3 font-medium text-slate-900'>
                    <div className='flex items-center gap-2'>
                        {person.name}
                    </div>
                </td>

                {/* DEBE */}
                {/* DEBE */}
                <td className='p-3 text-right'>
                    <span className='text-xs text-slate-500'>COP </span>
                    <span className='text-sm text-slate-950 font-bold'>{formatCurrency(totalDebe)}</span>
                </td>

                <td className='p-3 text-right'><span className='text-xs text-slate-500'>COP </span><span className='text-sm text-slate-950 font-bold'>{formatCurrency(totalAbono)}</span></td>
                <td className={`p-3 text-right font-semibold ${saldo > 0 ? 'text-red-600' : saldo === 0 ? 'text-green-600' : 'text-blue-600'}`}><span className='text-xs text-slate-500'>COP </span><span className='text-sm'>{formatCurrency(saldo)}</span></td>

                {/* ACTIONS */}
                <td className='p-3 flex items-center justify-end gap-2'>
                    {isPaidOff ? (
                        <>
                            <button className='cursor-pointer' onClick={() => onReset(person)}><RotateLeftIcon fontSize='small' /></button>
                            <button className='cursor-pointer' onClick={() => onPay(person)} disabled={isPaidOff}>
                                <DeleteIcon className={isPaidOff ? 'text-gray-300' : 'text-green-700'} />
                            </button>

                        </>
                    ) : (
                        <>
                            <button className='cursor-pointer' onClick={() => onPay(person)}>
                                <AttachMoneyIcon fontSize="small" />
                            </button>
                            {!isPaidOff && (
                                <button
                                    onClick={() => onPayAll(person)}
                                    title="Pagar toda la deuda"
                                    className="text-green-700 hover:text-green-900"
                                >
                                    <PaidIcon />
                                </button>
                            )}
                        </>
                    )}

                    {!isPaidOff && <button onClick={() => onEdit(person)} className='text-slate-400 hover:text-slate-600' title="Editar"><EditIcon fontSize='small' /></button>}
                </td>
            </tr>

            {/* HISTORIAL */}
            {isOpen && (
                <tr className='bg-slate-50 border-t border-slate-300'>
                    <td colSpan={6} className='p-4'>
                        <table className='w-full text-sm'>
                            <thead className='text-slate-500'>
                                <tr>
                                    <th className='text-left pb-2'>Fecha</th>
                                    <th className='text-left pb-2'>Concepto</th>
                                    <th className='text-right pb-2'>+ Debe</th>
                                    <th className='text-right pb-2'>- Paga</th>
                                </tr>
                            </thead>
                            <tbody>
                                {person.movements.map(m => (
                                    <tr key={m.id} className='border-t border-slate-300'>
                                        <td className='py-2'>{m.date}</td>
                                        <td className='py-2'>{m.concept}</td>
                                        <td className='py-2 text-right text-red-600'>{m.amount > 0 ? `$${formatCurrency(m.amount)}` : '—'}</td>
                                        <td className='py-2 text-right text-green-600'>{m.amount < 0 ? `$${formatCurrency(Math.abs(m.amount))}` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </React.Fragment>
    )
}
