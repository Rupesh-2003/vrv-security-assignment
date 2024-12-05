"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CollapsibleSettings = ({setValue, threshold}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [thresholdValue, setThresholdValue] = useState(threshold)

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleInputChange = (event) => {
    // Only allow numeric input
    const value = event.target.value.replace(/[^0-9]/g, "")
    setThresholdValue(value)
    setValue(value)
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <Button
        onClick={toggleOpen}
        variant="outline"
        className="w-full justify-between"
      >
        <span>Additional Settings</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      {isOpen && (
        <div className="p-4 border rounded-md space-y-2">
          <Label htmlFor="threshold">Suspicious Threshold Value</Label>
          <Input
            id="threshold"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={thresholdValue}
            onChange={handleInputChange}
            placeholder="Enter a number"
          />
        </div>
      )}
    </div>
  )
}

export default CollapsibleSettings
