import { useState, useRef, useEffect } from "react";
import styles from "./styles/dropdownMenu.module.scss";
import { useNavigate } from "react-router-dom";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    {
      id: "design",
      name: "Design",
      subCategories: [
        "Logo Design",
        "UX/UI Design",
        "Web Design",
        "Graphic Design",
        "Product Design",
      ],
    },
    {
      id: "development",
      name: "Development",
      subCategories: [
        "Web Development",
        "Mobile Apps",
        "Game Development",
        "WordPress",
        "E-commerce Development",
      ],
    },
    {
      id: "writing",
      name: "Writing",
      subCategories: [
        "Content Writing",
        "Copywriting",
        "Technical Writing",
        "Creative Writing",
        "Editing & Proofreading",
      ],
    },
    {
      id: "marketing",
      name: "Marketing",
      subCategories: [
        "Social Media Marketing",
        "SEO",
        "Email Marketing",
        "PPC Advertising",
        "Content Marketing",
      ],
    },
    {
      id: "video",
      name: "Video",
      subCategories: [
        "Video Editing",
        "Animation",
        "Videography",
        "Motion Graphics",
        "Whiteboard Videos",
      ],
    },
    {
      id: "music",
      name: "Music",
      subCategories: [
        "Music Production",
        "Songwriting",
        "Mixing & Mastering",
        "Voice-Over",
        "Jingles & Intros",
      ],
    },
    {
      id: "business",
      name: "Business",
      subCategories: [
        "Virtual Assistant",
        "Market Research",
        "Business Plans",
        "Presentations",
        "Data Entry",
      ],
    },
    {
      id: "lifestyle",
      name: "Lifestyle",
      subCategories: [
        "Online Tutoring",
        "Fitness & Nutrition",
        "Relationship Advice",
        "Life Coaching",
        "Personal Styling",
      ],
    },
    {
      id: "graphics",
      name: "Graphics",
      subCategories: [
        "Illustration",
        "Cartoons & Comics",
        "Photoshop Editing",
        "T-Shirts & Merchandise",
        "Packaging Design",
      ],
    },
    {
      id: "technology",
      name: "Technology",
      subCategories: [
        "IT & Networking",
        "Data Analysis",
        "Cybersecurity",
        "Artificial Intelligence",
        "Blockchain",
      ],
    },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleSubCategoryClick = (mainCategory, subCategory) => {
    navigate(`/category/${mainCategory}/${subCategory}`);
    setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={styles.dropdown}>
      <button className={styles.dropdownToggle} onClick={toggleDropdown}>
        Explore
      </button>
      {isOpen && (
        <ul className={styles.menu}>
          {categories.map((category) => (
            <li key={category.id} className={styles.menuItem}>
              <span className={styles.menuItemText}>{category.name}</span>
              <ul className={styles.subMenu}>
                {category.subCategories.map((subCategory, index) => (
                  <li
                    key={index}
                    className={styles.subMenuItem}
                    onClick={() =>
                      handleSubCategoryClick(category.id, subCategory)
                    }
                  >
                    {subCategory}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
