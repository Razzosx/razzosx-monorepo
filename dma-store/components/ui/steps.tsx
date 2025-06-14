"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep?: number
}

export function Steps({ currentStep = 0, className, children, ...props }: StepsProps) {
  const steps = React.Children.toArray(children)
  const totalSteps = steps.length

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-center font-medium",
                  index < currentStep
                    ? "border-[#00ADB5] bg-[#00ADB5] text-[#222831]"
                    : index === currentStep
                      ? "border-[#00ADB5] text-[#00ADB5]"
                      : "border-[#EEEEEE]/30 text-[#EEEEEE]/30",
                )}
              >
                {index + 1}
              </div>
              <div
                className={cn(
                  "mt-2 text-center text-xs font-medium",
                  index <= currentStep ? "text-[#EEEEEE]" : "text-[#EEEEEE]/30",
                )}
              >
                {React.isValidElement(step) && step.props.title ? step.props.title : `Step ${index + 1}`}
              </div>
            </div>
            {index < totalSteps - 1 && (
              <div className={cn("h-0.5 flex-1", index < currentStep ? "bg-[#00ADB5]" : "bg-[#EEEEEE]/30")} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

interface StepProps {
  title: string
  children?: React.ReactNode
}

export function Step({ title, children }: StepProps) {
  return <>{children}</>
}
