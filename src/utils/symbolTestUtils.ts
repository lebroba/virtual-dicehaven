
import { SymbolDomain, SymbolIdentity } from "@/components/MilitarySymbol";

// All possible identity types
export const identities: SymbolIdentity[] = [
  'friend',
  'hostile',
  'neutral', 
  'unknown',
  'assumed-friend',
  'suspect',
  'pending'
];

// All possible domain types
export const domains: SymbolDomain[] = [
  'air',
  'space',
  'land-unit',
  'land-equipment',
  'sea-surface',
  'land-installation',
  'subsurface',
  'activity',
  'cyberspace',
  'unknown'
];

// Generate a combination of each identity and domain type
export const generateAllSymbolCombinations = () => {
  const combinations: {id: string; identity: SymbolIdentity; domain: SymbolDomain}[] = [];
  
  // Create one combination for each possible identity-domain pair
  for (const identity of identities) {
    for (const domain of domains) {
      combinations.push({
        id: `${identity}-${domain}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        identity,
        domain
      });
    }
  }
  
  return combinations;
};

// Generate random position on the map
export const getRandomPosition = (maxWidth: number, maxHeight: number) => {
  return {
    x: Math.random() * (maxWidth - 100) + 50, // 50px padding from edges
    y: Math.random() * (maxHeight - 100) + 50
  };
};
