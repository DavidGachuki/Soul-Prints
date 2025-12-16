// Location services for user discovery settings

export interface LocationData {
    latitude: number;
    longitude: number;
    city?: string;
}

/**
 * Request location permission and get current position
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser');
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Location obtained:', { latitude, longitude });

                // Get city name via reverse geocoding
                const city = await reverseGeocode(latitude, longitude);

                resolve({ latitude, longitude, city });
            },
            (error) => {
                console.error('❌ Location error:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Reverse geocode coordinates to get city name
 * Uses OpenStreetMap Nominatim API (free, no key required)
 */
async function reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            {
                headers: {
                    'User-Agent': 'SoulPrints/1.0'
                }
            }
        );

        if (!response.ok) {
            console.error('Reverse geocoding failed');
            return undefined;
        }

        const data = await response.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
        console.log('🏙️ City found:', city);
        return city;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return undefined;
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}
