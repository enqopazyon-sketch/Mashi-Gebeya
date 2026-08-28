import React from 'react';

export default function CategoryFilter({ selectedCategory, setSelectedCategory, t }) {
  const categories = [
    { id: "all", label: t.allCategories },
    { id: "ማልያዎች (Jerseys)", label: t.catJerseys },
    { id: "ቱታዎችና ጃኬቶች (Tracksuits)", label: t.catTracksuits },
    { id: "ጫማዎች (Shoes)", label: t.catShoes },
    { id: "ሽቶዎችና የውበት እቃዎች (Perfumes & Care)", label: t.catPerfumes },
    { id: "ቸኮሌቶችና መክሰሶች (Chocolates & Treats)", label: t.catChocolates }
  ];

  return (
    <div className="category-container">
      {categories.map((cat) => {
        const isActive = (cat.id === "all" && !selectedCategory) || selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            className={`category-chip ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id === "all" ? "" : cat.id)}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
