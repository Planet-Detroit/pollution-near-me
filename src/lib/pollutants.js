/**
 * Plain-language descriptions of air pollutants.
 * Keys are normalized to uppercase for matching.
 * Each entry has: name (display), health (health effects), sources (common sources).
 */
const POLLUTANT_INFO = {
  'ASBESTOS': {
    name: 'Asbestos',
    health: 'Causes mesothelioma, lung cancer, and asbestosis. No safe level of exposure. Effects can appear decades after exposure.',
    sources: 'Demolition of older buildings, brake manufacturing, insulation removal.',
  },
  'CARBON MONOXIDE': {
    name: 'Carbon Monoxide (CO)',
    health: 'Reduces the blood\'s ability to carry oxygen. Can cause headaches, dizziness, and at high levels, death. Especially dangerous for people with heart disease.',
    sources: 'Burning fossil fuels — vehicles, power plants, industrial boilers, refineries.',
  },
  'CHLORINE': {
    name: 'Chlorine',
    health: 'Irritates the eyes, skin, and respiratory tract. At high concentrations, can cause severe lung damage and pulmonary edema.',
    sources: 'Chemical manufacturing, water treatment facilities, paper/pulp mills.',
  },
  'CHROMIUM': {
    name: 'Chromium',
    health: 'Hexavalent chromium (Cr-VI) is a known human carcinogen that causes lung cancer. Also causes respiratory irritation, kidney and liver damage.',
    sources: 'Chrome plating, stainless steel welding, leather tanning, metal finishing.',
  },
  'COPPER': {
    name: 'Copper',
    health: 'Inhaling copper dust or fumes can cause irritation of the nose, mouth, and eyes, nausea, and "metal fume fever."',
    sources: 'Metal smelting, foundries, welding, electronics manufacturing.',
  },
  'HEXAVALENT': {
    name: 'Hexavalent Chromium (Cr-VI)',
    health: 'A potent carcinogen — causes lung cancer even at low levels. Also causes nasal ulcers, skin rashes, and kidney damage.',
    sources: 'Chrome plating, stainless steel welding, pigment manufacturing.',
  },
  'HYDROCHLORIC ACID': {
    name: 'Hydrochloric Acid (HCl)',
    health: 'Causes severe irritation of the eyes and respiratory tract. Chronic exposure can lead to bronchitis, dental erosion, and skin inflammation.',
    sources: 'Chemical manufacturing, metal pickling, incinerators, coal combustion.',
  },
  'HYDROGEN SULFIDE': {
    name: 'Hydrogen Sulfide (H\u2082S)',
    health: 'Smells like rotten eggs at low levels. At higher concentrations, causes headaches, nausea, and eye irritation. Very high levels can be fatal within minutes.',
    sources: 'Landfills, wastewater treatment, refineries, paper mills, natural gas processing.',
  },
  'MERCURY': {
    name: 'Mercury',
    health: 'A potent neurotoxin that damages the brain and nervous system. Especially harmful to developing fetuses and young children. Accumulates in the body over time.',
    sources: 'Coal-fired power plants, waste incinerators, cement kilns, chemical manufacturing.',
  },
  'NITROGEN OXIDES': {
    name: 'Nitrogen Oxides (NOx)',
    health: 'Irritates airways and worsens asthma and other respiratory diseases. A key ingredient in smog (ground-level ozone) formation. Linked to increased emergency room visits and hospitalizations.',
    sources: 'Power plants, industrial boilers, vehicles, refineries — anything that burns fuel at high temperatures.',
  },
  'NITROGEN OXIDES NO2': {
    name: 'Nitrogen Dioxide (NO\u2082)',
    health: 'Inflames airways and increases susceptibility to respiratory infections. Children, the elderly, and people with asthma are most vulnerable. Contributes to smog and acid rain.',
    sources: 'Power plants, industrial boilers, vehicles, refineries.',
  },
  'NONMETHANE ORGANIC GASES [NMOG]': {
    name: 'Non-Methane Organic Gases (NMOG)',
    health: 'A broad category of volatile chemicals. Many are smog precursors. Some individual compounds (benzene, formaldehyde) are known carcinogens.',
    sources: 'Refineries, chemical plants, paint and coating operations, fuel storage.',
  },
  'PARTICULATE MATTER': {
    name: 'Particulate Matter (PM)',
    health: 'Tiny particles that penetrate deep into the lungs and bloodstream. Causes heart attacks, strokes, asthma attacks, lung cancer, and premature death. No safe level.',
    sources: 'Industrial combustion, construction, road dust, power plants, vehicles.',
  },
  'PARTICULATE MATTER < 10 UM': {
    name: 'Coarse Particulate Matter (PM10)',
    health: 'Particles small enough to be inhaled into the lungs. Causes coughing, asthma attacks, and respiratory inflammation. Especially harmful for children and people with lung disease.',
    sources: 'Dust from construction and roads, crushing/grinding operations, agricultural activities.',
  },
  'PARTICULATE MATTER < 2.5 UM': {
    name: 'Fine Particulate Matter (PM2.5)',
    health: 'Among the most dangerous air pollutants. These microscopic particles enter the bloodstream through the lungs, causing heart attacks, strokes, lung cancer, and premature death. Linked to approximately 100,000 U.S. deaths per year.',
    sources: 'Combustion — power plants, vehicles, industrial boilers, wildfires. Also formed chemically in the atmosphere from SO\u2082 and NOx emissions.',
  },
  'SULFUR DIOXIDE': {
    name: 'Sulfur Dioxide (SO\u2082)',
    health: 'Constricts airways, making breathing difficult. Triggers asthma attacks, especially in children. Even brief exposure (5-10 minutes) can affect people with asthma. Contributes to acid rain and fine particle formation.',
    sources: 'Coal and oil combustion, refineries, metal smelters, paper mills.',
  },
  'TOLUENE': {
    name: 'Toluene',
    health: 'Causes headaches, dizziness, and eye/throat irritation at low levels. Chronic exposure can damage the nervous system, liver, and kidneys.',
    sources: 'Paint and coating manufacturing, printing, rubber processing, chemical plants.',
  },
  'TOTAL HAZARDOUS AIR POLLUTANTS (HAPS)': {
    name: 'Hazardous Air Pollutants (HAPs)',
    health: 'A category of 187 toxic chemicals designated by the EPA as causing cancer, birth defects, or other serious health effects. Includes benzene, formaldehyde, asbestos, and mercury.',
    sources: 'Chemical plants, refineries, steel mills, power plants, dry cleaners.',
  },
  'TOTAL PARTICULATE MATTER': {
    name: 'Total Particulate Matter',
    health: 'Airborne particles of all sizes. Smaller particles (PM2.5, PM10) are the most dangerous because they penetrate deep into the lungs and bloodstream, causing respiratory and cardiovascular disease.',
    sources: 'Industrial combustion, material handling, construction, power plants.',
  },
  'VOLATILE ORGANIC COMPOUNDS (VOCS)': {
    name: 'Volatile Organic Compounds (VOCs)',
    health: 'A large group of chemicals that evaporate easily. Many cause cancer (benzene, formaldehyde). Others cause headaches, nausea, and organ damage. VOCs react with NOx in sunlight to form ground-level ozone (smog).',
    sources: 'Refineries, chemical plants, paint/coating operations, printing, auto manufacturing.',
  },
  'FACIL': {
    name: 'Facility-Wide Violation',
    health: 'This is not a specific pollutant. "FACIL" means the violation was facility-wide — typically a recordkeeping, monitoring, or reporting failure — rather than tied to a specific chemical emission.',
    sources: '',
  },
}

/**
 * Look up pollutant info by name. Handles case-insensitive matching.
 * Returns { name, health, sources } or null.
 */
export function getPollutantInfo(pollutantName) {
  if (!pollutantName) return null
  const key = pollutantName.trim().toUpperCase()
  return POLLUTANT_INFO[key] || null
}

/**
 * Parse a comma-separated pollutant string and return info for each.
 * Filters out FACIL unless it's the only one.
 */
export function parsePollutants(pollutantString) {
  if (!pollutantString) return []
  const names = pollutantString.split(',').map(s => s.trim()).filter(Boolean)
  const results = names.map(name => ({
    raw: name,
    info: getPollutantInfo(name),
  }))

  // If we have real pollutants, filter FACIL out for cleaner display
  const real = results.filter(r => r.raw.toUpperCase() !== 'FACIL')
  if (real.length > 0) return real
  return results
}
