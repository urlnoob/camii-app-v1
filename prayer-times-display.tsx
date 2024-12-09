'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Cloud, CloudRain, CloudSun } from 'lucide-react'
import { getPrayerTimes } from '../api/prayerTimes'
import { hadiths } from '../data/hadiths'

export default function PrayerTimesDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [currentHadith, setCurrentHadith] = useState(hadiths[0])
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      const date = currentTime.toISOString().split('T')[0]
      const times = await getPrayerTimes('stadtoldendorf', date)
      setPrayerTimes(times)
    }

    fetchPrayerTimes()
  }, [currentTime])

  useEffect(() => {
    // Change hadith daily
    const hadithIndex = Math.floor((currentTime.getTime() / (1000 * 60 * 60 * 24)) % hadiths.length)
    setCurrentHadith(hadiths[hadithIndex])
  }, [currentTime])

  if (!prayerTimes) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Stadtoldendorf</h1>
            <p className="text-gray-400">Diyanet Takvimi</p>
          </div>
          <div className="flex gap-4">
            <Cloud className="w-8 h-8" />
            <CloudRain className="w-8 h-8" />
            <CloudSun className="w-8 h-8" />
          </div>
        </div>

        {/* Main Time Display */}
        <div className="text-center mb-12">
          <h2 className="text-xl mb-4">Vaktin Çıkmasına</h2>
          <div className="text-8xl font-bold mb-4">
            {currentTime.toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <p className="text-xl">
            {currentTime.toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} - {prayerTimes.hijriDate}
          </p>
        </div>

        {/* Prayer Times Grid */}
        <div className="grid grid-cols-7 gap-4 mb-8">
          {Object.entries(prayerTimes.times).map(([name, time]) => (
            <Card key={name} className="bg-gray-800 p-4 text-center rounded-lg">
              <h3 className="text-xl mb-2">{name}</h3>
              <p className="text-2xl font-bold">{time}</p>
            </Card>
          ))}
        </div>

        {/* Hadith Quote */}
        <div className="text-center text-gray-400 text-lg max-w-3xl mx-auto">
          <p>{currentHadith.text}</p>
          <p className="mt-2">- {currentHadith.source}</p>
        </div>

        {/* QR Code */}
        <div className="absolute bottom-8 right-8">
          <div className="w-24 h-24 bg-white p-2 rounded-lg">
            {/* QR code would be implemented here */}
          </div>
        </div>
      </div>
    </div>
  )
}

