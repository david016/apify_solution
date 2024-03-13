const API_URL = "http://localhost:3000/products";
const MAX_RETURNED_PRODUCTS = 1_000;
const MAX_PRICE = 100_000;
// const apiUrl = "https://api.ecommerce.com/products";

async function main() {
  let allProducts = await extractProducts(API_URL, 1, MAX_PRICE);
  return allProducts;
}

main().catch(console.error);

async function extractProducts(apiUrl, currentMinPrice, currentMaxPrice) {
  const products = [];
  const response = await fetch(
    `${apiUrl}?minPrice=${currentMinPrice}&maxPrice=${currentMaxPrice}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products. Status code: ${response.status}`
    );
  }

  const data = await response.json();
  const currentTotalProducts = data.total;

  if (currentTotalProducts <= MAX_RETURNED_PRODUCTS) {
    return data.products;
  }

  if (
    currentMinPrice === currentMaxPrice &&
    currentTotalProducts > MAX_RETURNED_PRODUCTS
  ) {
    throw new Error("Too many products found for the same price.");
  }

  const priceRange = currentMaxPrice - currentMinPrice;
  const middlePrice = Math.floor(currentMinPrice + priceRange / 2);
  const [firstHalf, secondHalf] = await Promise.all([
    extractProducts(apiUrl, currentMinPrice, middlePrice),
    extractProducts(apiUrl, middlePrice + 1, currentMaxPrice),
  ]);

  return products.concat(firstHalf, secondHalf);
}
