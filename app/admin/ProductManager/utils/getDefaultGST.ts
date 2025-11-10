export const getDefaultGST = (category: string) => {
  const clothingKeywords = [
    "t-shirt",
    "hoodie",
    "jersey",
    "shirt",
    "pant",
    "clothing",
    "apparel",
  ];

  const isClothing = clothingKeywords.some((word) =>
    category.toLowerCase().includes(word)
  );

  return isClothing
    ? { cgst: 2.5, sgst: 2.5, total: 5 }
    : { cgst: 6, sgst: 6, total: 12 };
};
