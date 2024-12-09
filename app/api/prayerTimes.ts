import type { PrayerTimeParams } from '@/types/prayer'
import axios from 'axios';

export async function getPrayerTimes(date: Date, params: PrayerTimeParams) {
  try {
    const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity/${date.toISOString().split('T')[0]}`, {
      params: params
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

