import ostan from 'iran-cities-json/ostan.json'
import shahr from 'iran-cities-json/shahr.json'

export const provinces = ostan

export function getCitiesByProvince(provinceId) {
    return shahr.filter(c => c.ostan === provinceId)
}
