import axios from 'axios';

const API_BASE_URL = 'https://api.ditib.de/prayer-times';

export async function getPrayerTimes(city: string, date: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/${city}/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

