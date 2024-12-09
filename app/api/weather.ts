const LATITUDE = 51.8667; // Beispielkoordinaten für Stadtoldendorf
const LONGITUDE = 9.6167; // Bitte mit den genauen Koordinaten ersetzen

export async function getWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=4`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export function getWeatherIcon(weatherCode: number) {
  // Vereinfachte Wettercodes-Zuordnung
  if (weatherCode <= 3) return 'Sun'; // Klar bis teilweise bewölkt
  if (weatherCode <= 48) return 'Cloud'; // Bewölkt
  if (weatherCode <= 77) return 'CloudRain'; // Regen oder Schnee
  return 'CloudLightning'; // Gewitter oder extreme Wetterbedingungen
}

