import axios from 'axios';

// Function to get FIPS code
export async function get_fips_code(lat, lon) {
  try {
    const response = await axios.get(`https://geo.fcc.gov/api/census/block/find?latitude=${lat}&longitude=${lon}&format=json`);
    const fipsCode = response.data?.County?.FIPS;

    if (fipsCode) {
      return fipsCode.slice(0, 5); // Return first 5 digits of the FIPS code
    } else {
      throw new Error('FIPS code not found');
    }
  } catch (error) {
    console.error('Error fetching FIPS code:', error);
    throw error;
  }
}
