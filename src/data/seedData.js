const unsplash = (id, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`

export const IMAGES = {
  hero: unsplash('photo-1593113598332-cd288d649433', 1400),
  table: unsplash('photo-1504674900247-0877df9cc836'),
  biryani: unsplash('photo-1631515243349-e0cb75fb8d3a'),
  bakery: unsplash('photo-1509440159596-0249088772ff'),
  curryPan: unsplash('photo-1596797038530-2c107229654b'),
  sandwich: unsplash('photo-1528735602780-2552fd46c7af'),
  curry: unsplash('photo-1585937421612-70a008356fbe'),
  paneer: unsplash('photo-1567188040759-fb8a883dc6d8'),
  frenchToast: unsplash('photo-1484723091739-30a097e8f929'),
  pavBhaji: unsplash('photo-1606491956689-2ea866880c84'),
  produce: unsplash('photo-1542838132-92c53300491e'),
  biryaniPlate: unsplash('photo-1589302168068-964664d93dc0'),
  veggies: unsplash('photo-1498837167922-ddd27525d352'),
}

export const FOOD_CATEGORIES = [
  'Cooked Meals',
  'Bakery & Breads',
  'Fresh Produce',
  'Packaged & Pantry',
  'Dairy & Desserts',
  'Beverages',
]

export const DONOR_TYPES = [
  'Restaurant',
  'Event Venue',
  'Bakery',
  'Household',
  'Grocery Store',
  'Caterer',
  'Campus / Office',
]

export const PHOTO_OPTIONS = [
  { label: 'Shared table', url: IMAGES.table },
  { label: 'Fresh bakes', url: IMAGES.bakery },
  { label: 'Home curry', url: IMAGES.curryPan },
  { label: 'Garden produce', url: IMAGES.produce },
  { label: 'Celebration meal', url: IMAGES.biryani },
  { label: 'Sandwiches', url: IMAGES.sandwich },
]

/** There are no preloaded listings; new posts are created by community members. */
export const createSeedPosts = () => []
