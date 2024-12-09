'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { getPrayerTimes } from '@/app/api/prayerTimes'
import { getWeather, getWeatherIcon } from '@/app/api/weather'
import { hadiths } from '../data/hadiths'
import Image from 'next/image'
import { InstagramQR } from './instagram-qr'
import { WeatherIcon } from './weather-icon'

const prayerTimeParams = {
  city: 'Stadtoldendorf',
  country: 'Germany',
  method: 13,
  school: 1,
  midnightMode: 0,
  timezonestring: 'Europe/Berlin',
  latitudeAdjustmentMethod: 'ANGLE_BASED',
};

const prayerNames = {
  Fajr: { tr: 'İmsak', de: 'Fajr' },
  Sunrise: { tr: 'Güneş', de: 'Sunrise' },
  Dhuhr: { tr: 'Öğle', de: 'Dhuhr' },
  Asr: { tr: 'İkindi', de: 'Asr' },
  Maghrib: { tr: 'Akşam', de: 'Maghrib' },
  Isha: { tr: 'Yatsı', de: 'Isha' }
};

const translations = {
  title: { tr: 'Camii Stadtoldendorf', de: 'Moschee Stadtoldendorf' },
  subtitle: { tr: 'Diyanet Takvimi', de: 'Diyanet Kalender' },
  loading: { tr: 'Yükleniyor...', de: 'Wird geladen...' },
};

const weekDays = {
  tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
};

function getNextPrayer(prayerTimes: any, currentTime: Date) {
  const now = currentTime.getTime();
  let nextPrayer = null;
  let timeUntilNextPrayer = Infinity;

  for (const [key, name] of Object.entries(prayerNames)) {
    const prayerTime = new Date(currentTime.toDateString() + ' ' + prayerTimes.timings[key]).getTime();
    const timeDiff = prayerTime - now;

    if (timeDiff > 0 && timeDiff < timeUntilNextPrayer) {
      nextPrayer = name;
      timeUntilNextPrayer = timeDiff;
    }
  }

  if (!nextPrayer) {
    nextPrayer = prayerNames.Fajr;
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFajr = new Date(tomorrow.toDateString() + ' ' + prayerTimes.timings.Fajr).getTime();
    timeUntilNextPrayer = tomorrowFajr - now;
  }

  return { nextPrayer, timeUntilNextPrayer };
}

function formatTimeUntil(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const formatCurrentTime = (date: Date) => {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const WeatherCard = React.memo(({ day, icon, temp }: { day: string; icon: string; temp: number }) => (
  <Card className="bg-gray-800/95 p-4 text-center rounded-lg flex flex-col justify-between min-h-[90px]">
    <p className="text-4xl font-medium text-gray-300">{day}</p>
    <div className="my-2 flex-grow flex items-center justify-center">
      <WeatherIcon iconName={icon} />
    </div>
    <p className="text-4xl font-bold text-white">{temp}°C</p>
  </Card>
));

const PrayerTimeCard = React.memo(({ name, time, subtitle }: { name: string; time: string; subtitle: string }) => (
  <Card className="bg-gray-800/95 p-4 text-center rounded-lg flex flex-col justify-between min-h-[90px]">
    <h3 className="text-4xl mb-2 text-gray-300">{name}</h3>
    <p className="text-8xl font-bold text-white flex-grow flex items-center justify-center">{time}</p>
    <p className="text-2xl text-gray-400 mt-2">{subtitle}</p>
  </Card>
));

const PrayerTimesDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [currentHadith, setCurrentHadith] = useState(hadiths[0]);
  const [nextPrayer, setNextPrayer] = useState<{ tr: string; de: string } | null>(null);
  const [timeUntilNextPrayer, setTimeUntilNextPrayer] = useState<string | null>(null);
  const [lang, setLang] = useState<'tr' | 'de'>('tr');
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [times, weather] = await Promise.all([
        getPrayerTimes(new Date(), prayerTimeParams),
        getWeather()
      ]);
      setPrayerTimes(times);
      setWeatherData(weather);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const dataFetchInterval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(dataFetchInterval);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (prayerTimes) {
        const { nextPrayer, timeUntilNextPrayer } = getNextPrayer(prayerTimes, now);
        setNextPrayer(nextPrayer);
        setTimeUntilNextPrayer(formatTimeUntil(timeUntilNextPrayer));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);

  useEffect(() => {
    const now = new Date();
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    const newHadithIndex = daysSinceEpoch % hadiths.length;

    setCurrentHadithIndex(newHadithIndex);
    setCurrentHadith({
      text: hadiths[newHadithIndex][lang],
      source: hadiths[newHadithIndex].source
    });

    const languageTimer = setInterval(() => {
      setLang(prevLang => {
        const newLang = prevLang === 'tr' ? 'de' : 'tr';
        setCurrentHadith({
          text: hadiths[newHadithIndex][newLang],
          source: hadiths[newHadithIndex].source
        });
        return newLang;
      });
    }, 10000);

    return () => clearInterval(languageTimer);
  }, [lang]);


  if (!prayerTimes || !weatherData) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-2xl">{translations.loading[lang]}</div>;
  }

  return (
    <div className="w-full h-screen mx-auto bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full flex flex-col justify-between">
        {/* Header */}
        <div className="bg-gray-800/95 p-6 rounded-lg mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/STADTOLDENDORF.png"
              alt="S-Dorf Camii Logo"
              width={64}
              height={64}
              className="mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold">{translations.title[lang]}</h1>
              <p className="text-3xl">{translations.subtitle[lang]}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-4xl text-white">
                  {currentTime.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-3xl text-gray-300">{prayerTimes.date.hijri.date}</p>
              </div>
              <WeatherIcon iconName={getWeatherIcon(weatherData.current.weathercode)} />
              <span className="text-5xl font-bold text-white">{Math.round(weatherData.current.temperature_2m)}°C</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow grid grid-cols-6 gap-4 my-4">
          {/* Left side: Prayer times grid */}
          <div className="col-span-3 grid grid-cols-2 grid-rows-3 gap-4">
            {Object.entries(prayerNames).map(([key, name]) => (
              <PrayerTimeCard
                key={key}
                name={name[lang]}
                time={prayerTimes.timings[key]}
                subtitle={name[(lang === 'tr' ? 'de' : 'tr')]}
              />
            ))}
          </div>

          {/* Right side */}
          <div className="col-span-3 grid grid-rows-3 gap-4">
            {/* Current time */}
            <Card className="bg-gray-800/95 row-span-1 p-4 text-center rounded-lg flex items-center justify-center min-h-[100px]">
              <p className="text-9xl font-bold text-white">{formatCurrentTime(currentTime)}</p>
            </Card>

            {/* Next prayer */}
            <Card className="bg-gray-800/95 row-span-1 p-4 text-center rounded-lg flex flex-col justify-between min-h-[200px] border-2 border-[#FFD700]">
              <h3 className="text-6xl text-gray-300">
                {nextPrayer ? (lang === 'tr' ? nextPrayer.tr : nextPrayer.de) : ''}
              </h3>
              <p className="text-8xl font-bold text-white">
                {prayerTimes.timings[Object.keys(prayerNames).find(key =>
                  prayerNames[key] === nextPrayer
                ) || 'Fajr']}
              </p>
              <p className="text-4xl text-gray-400">{timeUntilNextPrayer}</p>
            </Card>

            {/* Weather forecast */}
            <div className="grid grid-cols-3 gap-4 row-span-1">
              {weatherData.daily.time.slice(1, 4).map((day: string, index: number) => {
                const date = new Date(day);
                return (
                  <WeatherCard
                    key={index}
                    day={weekDays[lang][date.getDay()]}
                    icon={getWeatherIcon(weatherData.daily.weathercode[index + 1])}
                    temp={Math.round(weatherData.daily.temperature_2m_max[index + 1])}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Hadith and QR */}
        <div className="grid grid-cols-6 gap-4 min-h-[350px]">
          <Card className="col-span-5 bg-gray-800/95 p-6 text-center rounded-lg flex flex-col justify-center items-center">
            <p className="text-5xl italic text-white mb-4">&ldquo;{currentHadith.text}&rdquo;</p>
            <p className="text-2xl font-semibold text-gray-300">- {currentHadith.source}</p>
          </Card>
          <div className="col-span-1 flex items-center justify-center bg-gray-800/95 rounded-lg">
            <InstagramQR />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrayerTimesDisplay;

