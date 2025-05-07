"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, StopCircle } from "lucide-react"
import jsQR from "jsqr"
import { useToast } from "@/hooks/use-toast"

interface QRScannerProps {
  onScan: (data: string) => void
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScanner = async () => {
    try {
      toast({
        title: "Starting Camera",
        description: "Please allow camera access to scan QR codes.",
        variant: "default",
      })

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        setPermissionDenied(false)

        toast({
          title: "Camera Active",
          description: "Point your camera at a QR code to scan.",
          variant: "default",
        })

        // Start scanning after a short delay to ensure video is playing
        setTimeout(() => {
          scanQRCode()
        }, 1000)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setPermissionDenied(true)

      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access in your browser settings to scan QR codes.",
        variant: "destructive",
      })
    }
  }

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    setScanning(false)

    toast({
      title: "Camera Stopped",
      description: "QR code scanning has been stopped.",
      variant: "default",
    })
  }

  const scanQRCode = () => {
    if (!scanning) return

    // Clear any existing interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    // Set up a scanning interval instead of requestAnimationFrame for more reliability
    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current

      if (!video || !canvas) return

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.height = video.videoHeight
        canvas.width = video.videoWidth
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        })

        if (code) {
          // Clear the interval when a QR code is found
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current)
            scanIntervalRef.current = null
          }

          stopScanner()

          toast({
            title: "QR Code Detected",
            description: "Successfully scanned a QR code.",
            variant: "success",
          })

          onScan(code.data)
        }
      }
    }, 200) // Scan every 200ms
  }

  useEffect(() => {
    return () => {
      // Clean up on component unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${scanning ? "block" : "hidden"}`}
          playsInline
        ></video>
        <canvas ref={canvasRef} className="hidden"></canvas>

        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-blue-500 opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 animate-pulse"></div>
          </div>
        )}
      </div>

      <div className="mt-4">
        {!scanning ? (
          <Button onClick={startScanner} className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="destructive" className="flex items-center gap-2">
            <StopCircle className="h-4 w-4" />
            Stop Camera
          </Button>
        )}
      </div>

      {permissionDenied && (
        <p className="mt-2 text-sm text-red-500">Camera access denied. Please allow camera access to scan QR codes.</p>
      )}

      {scanning && (
        <p className="mt-2 text-sm text-blue-500">Scanning for QR codes... Please hold your device steady.</p>
      )}
    </div>
  )
}
