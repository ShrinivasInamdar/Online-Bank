"use client"

import { useEffect, useRef, useState } from "react"
import QRCodeLib from "qrcode"

export default function QRCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    // Get user email from localStorage
    const userInfoStr = localStorage.getItem("userInfo")
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      setUserEmail(userInfo.email)
    }
  }, [])

  useEffect(() => {
    if (userEmail && canvasRef.current) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        userEmail,
        {
          width: 220,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error)
        },
      )
    }
  }, [userEmail])

  useEffect(() => {
    const downloadButton = document.getElementById("download-qr")
    if (downloadButton && canvasRef.current) {
      downloadButton.addEventListener("click", () => {
        const canvas = canvasRef.current
        if (canvas) {
          const image = canvas.toDataURL("image/png")
          const link = document.createElement("a")
          link.href = image
          link.download = "my-payment-qr.png"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      })
    }
  }, [userEmail])

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border">
      <canvas ref={canvasRef} className="w-56 h-56"></canvas>
      <p className="mt-2 text-sm font-medium">{userEmail}</p>
    </div>
  )
}
