import { useEffect, useState } from 'react'

interface CountUpProps {
    end: number
    duration?: number
    decimals?: number
    prefix?: string
    suffix?: string
}

export default function CountUp({ end, duration = 1000, decimals = 0, prefix = '', suffix = '' }: CountUpProps) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime: number | null = null
        let animationFrameId: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = timestamp - startTime
            const percentage = Math.min(progress / duration, 1)

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4)

            const currentCount = ease * end
            setCount(currentCount)

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate)
            } else {
                setCount(end)
            }
        }

        animationFrameId = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrameId)
    }, [end, duration])

    return (
        <span>
            {prefix}
            {count.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
            {suffix}
        </span>
    )
}
