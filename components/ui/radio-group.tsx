import React from 'react'
import { cn } from '@/lib/utils'

interface RadioGroupProps {
  label?: string
  error?: string
  children: React.ReactNode
  className?: string
}

interface RadioOptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  children?: React.ReactNode
}

const RadioGroup = ({ label, error, children, className }: RadioGroupProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="block text-sm font-medium text-gray-700">
          {label}
        </div>
      )}
      <div className="space-y-2">
        {children}
      </div>
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}

const RadioOption = React.forwardRef<HTMLInputElement, RadioOptionProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className={cn(
          "flex items-center space-x-3 p-3 border border-gray-300 rounded-md cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-colors",
          className
        )}>
          <input
            type="radio"
            className="h-4 w-4 text-primary-600 focus:ring-primary-600 border-gray-300"
            ref={ref}
            {...props}
          />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>
        {children && (
          <div className="ml-7">
            {children}
          </div>
        )}
      </div>
    )
  }
)
RadioOption.displayName = 'RadioOption'

export { RadioGroup, RadioOption }