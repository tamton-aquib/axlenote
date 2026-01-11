export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    // dd/mm/yyyy
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date)
}

export const formatCurrency = (amount: number, currency = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2, // Allow up to 2 decimals for cents/paisa
        minimumFractionDigits: 0
    }).format(amount)
}
