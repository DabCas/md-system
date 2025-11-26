'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface QuantityPickerProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  colorClass?: string
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  size = 'md',
  colorClass = 'text-gray-900',
}: QuantityPickerProps) {
  const sizeClasses = {
    sm: {
      button: 'h-8 w-8',
      icon: 'h-3 w-3',
      value: 'text-2xl w-12',
    },
    md: {
      button: 'h-10 w-10',
      icon: 'h-4 w-4',
      value: 'text-3xl w-16',
    },
    lg: {
      button: 'h-14 w-14',
      icon: 'h-6 w-6',
      value: 'text-5xl w-20',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={classes.button}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
      >
        <Minus className={classes.icon} />
      </Button>
      <div className={`${classes.value} font-bold text-center ${colorClass}`}>
        {value}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={classes.button}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
      >
        <Plus className={classes.icon} />
      </Button>
    </div>
  )
}
