export interface SampleWildlifeImage {
  id: string;
  title: string;
  species: string;
  category: string;
  imageUrl: string;
  description: string;
}

export const SAMPLE_WILDLIFE_IMAGES: SampleWildlifeImage[] = [
  {
    id: 'sample-bald-eagle',
    title: 'Bald Eagle in Gliding Flight',
    species: 'Haliaeetus leucocephalus (Bald Eagle)',
    category: 'Birds of Prey / Raptors',
    imageUrl: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80',
    description: 'Adult Bald Eagle soaring with outstretched wings against a deep clear mountain sky.'
  },
  {
    id: 'sample-peregrine-falcon',
    title: 'Peregrine Falcon Cliff Perch',
    species: 'Falco peregrinus (Peregrine Falcon)',
    category: 'Birds of Prey / Raptors',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    description: 'Apex raptor perched alertly on a weathered granite outcrop with razor-sharp gaze.'
  },
  {
    id: 'sample-barn-owl',
    title: 'Barn Owl at Twilight',
    species: 'Tyto alba (Western Barn Owl)',
    category: 'Nocturnal Raptors',
    imageUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80',
    description: 'Heart-faced Barn Owl flying low over golden meadow grass during twilight dusk.'
  },
  {
    id: 'sample-osprey',
    title: 'Osprey Catching Fish',
    species: 'Pandion haliaetus (Osprey / Sea Hawk)',
    category: 'Birds of Prey / Piscivore',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    description: 'Osprey emerging from river spray with talons locking freshly caught trout.'
  },
  {
    id: 'sample-red-tailed-hawk',
    title: 'Red-Tailed Hawk Banking Turn',
    species: 'Buteo jamaicensis (Red-Tailed Hawk)',
    category: 'Buteo / Soaring Raptors',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80',
    description: 'Magnificent hawk banking hard in thermals, showing fan-tail and underwing plumage.'
  }
];
