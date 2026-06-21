/**
 * Product data normalization utilities.
 * Standardizes product names, categories, units, and extracts units/quantities.
 */

const CATEGORIES = {
  PRODUCE: 'Produce',
  DAIRY_EGGS: 'Dairy & Eggs',
  BAKERY_BREAD: 'Bakery & Bread',
  MEAT_SEAFOOD: 'Meat & Seafood',
  PANTRY: 'Pantry',
  FROZEN_FOODS: 'Frozen Foods',
  BEVERAGES: 'Beverages',
  SNACKS: 'Snacks & Candy',
  DELI: 'Deli',
  HOUSEHOLD: 'Household',
  PERSONAL_CARE: 'Personal Care',
  BABY: 'Baby',
  PETS: 'Pets',
  OTHER: 'Other'
};

const UNIT_MAPPING = {
  'lb': 'lb',
  'lbs': 'lb',
  'pound': 'lb',
  'pounds': 'lb',
  'oz': 'oz',
  'ounce': 'oz',
  'ounces': 'oz',
  'fl oz': 'fl oz',
  'fl. oz.': 'fl oz',
  'fl. oz': 'fl oz',
  'fluid oz': 'fl oz',
  'fluid ounce': 'fl oz',
  'fluid ounces': 'fl oz',
  'g': 'g',
  'gram': 'g',
  'grams': 'g',
  'kg': 'kg',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'ml': 'ml',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'l': 'l',
  'liter': 'l',
  'liters': 'l',
  'gal': 'gal',
  'gallon': 'gal',
  'gallons': 'gal',
  'ct': 'ct',
  'count': 'ct',
  'counts': 'ct',
  'pk': 'ct',
  'pack': 'ct',
  'packs': 'ct',
  'ea': 'ea',
  'each': 'ea'
};

/**
 * Normalizes a unit string into a standard unit.
 * @param {string} unitStr - Raw unit string.
 * @returns {string} Normalized unit.
 */
function normalizeUnit(unitStr) {
  if (!unitStr) return 'each';
  const clean = unitStr.toLowerCase().trim().replace(/[.]/g, '');
  return UNIT_MAPPING[clean] || clean;
}

/**
 * Maps a diverse category name from a store to a standard category.
 * @param {string} categoryStr - Raw category string.
 * @returns {string} Normalized category.
 */
function normalizeCategory(categoryStr) {
  if (!categoryStr) return CATEGORIES.OTHER;
  
  const clean = categoryStr.toLowerCase().trim();
  
  // Produce
  if (/produce|fruit|vegetable|salad|greens|fresh herb/i.test(clean)) {
    return CATEGORIES.PRODUCE;
  }
  // Dairy & Eggs
  if (/dairy|egg|milk|cheese|yogurt|butter|cream|margarine/i.test(clean)) {
    return CATEGORIES.DAIRY_EGGS;
  }
  // Bakery & Bread
  if (/bakery|bread|tortilla|bun|bagel|pastry|croissant|muffin/i.test(clean)) {
    return CATEGORIES.BAKERY_BREAD;
  }
  // Meat & Seafood
  if (/meat|seafood|beef|chicken|pork|turkey|fish|shrimp|salmon|crab|lobster|bacon|sausage/i.test(clean)) {
    return CATEGORIES.MEAT_SEAFOOD;
  }
  // Frozen
  if (/frozen|ice cream|pizza|waffle/i.test(clean)) {
    return CATEGORIES.FROZEN_FOODS;
  }
  // Beverages
  if (/beverage|drink|soda|water|juice|coffee|tea|beer|wine|liquor/i.test(clean)) {
    return CATEGORIES.BEVERAGES;
  }
  // Snacks & Candy
  if (/snack|chip|cookie|cracker|nut|popcorn|candy|chocolate|pretzel|gummy/i.test(clean)) {
    return CATEGORIES.SNACKS;
  }
  // Deli
  if (/deli|prepared food|sandwich|hummus|olive|rotisserie/i.test(clean)) {
    return CATEGORIES.DELI;
  }
  // Household
  if (/household|clean|detergent|paper towel|toilet paper|trash bag|foil|plate/i.test(clean)) {
    return CATEGORIES.HOUSEHOLD;
  }
  // Personal Care
  if (/personal|care|shampoo|soap|toothpaste|deodorant|lotion|medicine|vitamin/i.test(clean)) {
    return CATEGORIES.PERSONAL_CARE;
  }
  // Baby
  if (/baby|diaper|formula|wipe/i.test(clean)) {
    return CATEGORIES.BABY;
  }
  // Pets
  if (/pet|dog|cat|bird/i.test(clean)) {
    return CATEGORIES.PETS;
  }
  // Pantry
  if (/pantry|cereal|pasta|rice|sauce|bean|soup|canned|spice|baking|oil|vinegar|condiment|spread|honey|syrup|jam/i.test(clean)) {
    return CATEGORIES.PANTRY;
  }

  return CATEGORIES.OTHER;
}

/**
 * Cleans and normalizes a product name.
 * @param {string} nameStr - Raw product name.
 * @returns {string} Normalized product name.
 */
function normalizeName(nameStr) {
  if (!nameStr) return '';
  return nameStr
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/^\s+|\s+$/g, '') // Trim
    .replace(/,\s*$/, ''); // Remove trailing commas
}

/**
 * Extracts quantity and unit from a product name.
 * @param {string} nameStr - Product name.
 * @returns {Object} { quantity: number, unit: string }
 */
function extractUnitAndQty(nameStr) {
  if (!nameStr) return { quantity: 1, unit: 'ea' };

  // Match expressions like "14.3 oz", "1.5 lb", "12ct", "2 liter", "59 fl oz"
  // Handles decimal quantities, optional space, and a list of units
  const regex = /(\d+(?:\.\d+)?)\s*(oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|ct|count|counts|ea|each|gal|gallon|gallons|pack|pk|fl\s*oz|fluid\s*oz)(?:\s+|$|\W)/i;
  const match = nameStr.match(regex);

  if (match) {
    const qty = parseFloat(match[1]);
    const unit = normalizeUnit(match[2]);
    return { quantity: qty, unit };
  }

  // Fallback for counts like "12-pack" or "6 pk"
  const pkRegex = /(\d+)\s*(?:pk|pack)/i;
  const pkMatch = nameStr.match(pkRegex);
  if (pkMatch) {
    return { quantity: parseInt(pkMatch[1], 10), unit: 'ct' };
  }

  return { quantity: 1, unit: 'ea' };
}

module.exports = {
  CATEGORIES,
  normalizeUnit,
  normalizeCategory,
  normalizeName,
  extractUnitAndQty
};
