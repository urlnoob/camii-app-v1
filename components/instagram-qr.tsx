import { QRCodeSVG } from 'qrcode.react'
import { Instagram } from 'lucide-react'

export function InstagramQR() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex items-center justify-center mb-6">
        <Instagram className="w-6 h-6 text-white mr-1" />
        <span className="text-2xl font-medium text-white">Folge uns</span>
      </div>
      <QRCodeSVG
        value="https://www.instagram.com/moschee_stadtoldendorf/"
        size={200}
        level="L"
        includeMargin={false}
        className="rounded"
      />
    </div>
  )
}

