// Density of average stony asteroid: ~3000 kg/m^3
const ASTEROID_DENSITY = 3000; 

export const calculateImpactStats = (diameterMeters, velocityKps) => {
  // Volume of sphere = 4/3 * pi * r^3
  const radius = diameterMeters / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  
  // Mass in kg
  const mass = volume * ASTEROID_DENSITY;
  
  // Velocity in meters per second
  const velocityMs = velocityKps * 1000;
  
  // Kinetic Energy = 1/2 m v^2 (in Joules)
  const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityMs, 2);
  
  // Convert Joules to Megatons of TNT (1 Mt = 4.184e15 Joules)
  const energyMt = kineticEnergyJoules / 4.184e15;
  
  // Simplified Crater size (km) = (Energy_Mt ^ 0.3) * 1.5
  const craterDiameterKm = Math.pow(energyMt, 0.3) * 1.5;
  
  // Fireball / Vaporization (km)
  const fireballRadiusKm = Math.pow(energyMt, 0.33) * 0.8;
  
  // Blast Radius with severe destruction (km)
  const blastRadiusKm = Math.pow(energyMt, 0.33) * 2.5;

  // Thermal radiation (3rd degree burns)
  const thermalRadiusKm = Math.pow(energyMt, 0.33) * 5.0;

  return {
    energyMt: energyMt.toFixed(2),
    craterDiameterKm: craterDiameterKm.toFixed(2),
    fireballRadiusKm: fireballRadiusKm.toFixed(2),
    blastRadiusKm: blastRadiusKm.toFixed(2),
    thermalRadiusKm: thermalRadiusKm.toFixed(2),
    mass: (mass / 1e9).toFixed(2), // in million tons
  };
};
