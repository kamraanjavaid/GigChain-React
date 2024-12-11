import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import styles from "./styles/createNewService.module.scss";

const CATEGORIES = [
  "Web Development",
  "Mobile App Development",
  "Graphic Design",
  "Digital Marketing",
  "Content Writing",
  "Video Editing",
  "Voice Over",
  "Translation",
  "Data Entry",
  "Virtual Assistant",
  "Social Media Management",
  "SEO Services",
  "UI/UX Design",
  "Business Consulting",
  "Photography",
  "3D Modeling",
  "Animation",
  "Music Production",
  "Illustration",
  "Blockchain Development",
];

const CreateServicePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    category: "",
    images: [],
  });

  const validateStep = (currentStep) => {
    let stepErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          stepErrors.title = "Title is required";
        } else if (formData.title.length < 5) {
          stepErrors.title = "Title must be at least 5 characters long";
        } else if (formData.title.length > 100) {
          stepErrors.title = "Title must be less than 100 characters";
        }

        if (!formData.category) {
          stepErrors.category = "Please select a category";
        }
        break;

      case 2:
        if (!formData.description.trim()) {
          stepErrors.description = "Description is required";
        } else if (formData.description.length < 50) {
          stepErrors.description =
            "Description must be at least 50 characters long";
        } else if (formData.description.length > 1000) {
          stepErrors.description =
            "Description must be less than 1000 characters";
        }
        break;

      case 3:
        if (!formData.startingPrice) {
          stepErrors.startingPrice = "Starting price is required";
        } else if (formData.startingPrice <= 0) {
          stepErrors.startingPrice = "Price must be greater than 0";
        } else if (formData.startingPrice > 10000) {
          stepErrors.startingPrice = "Price cannot exceed 10000";
        }
        break;

      case 4:
        if (formData.images.length === 0) {
          stepErrors.images = "At least one image is required";
        }
        break;

      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      setErrors((prev) => ({ ...prev, images: "Maximum 5 images allowed" }));
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Some files were rejected. Images must be under 5MB",
      }));
    }

    setFormData({
      ...formData,
      images: [...formData.images, ...validFiles].slice(0, 5),
    });
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          formData.images.forEach((image) => {
            formDataToSend.append("images", image);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append("user", currentUser._id);
      const serviceProvider =
        currentUser.firstName + " " + currentUser.lastName;
      formDataToSend.append("serviceProvider", serviceProvider);
      formDataToSend.append(
        "providerProfilePicture",
        currentUser.profilePictureUrl
      );

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/services/create`,
        formDataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/services");
    } catch (error) {
      setErrors({ submit: "Error creating service. Please try again." });
      console.error("Error creating service:", error);
    }
  };

  return (
    <div className={styles.parentWrapper}>
      <form onSubmit={handleSubmit} className={styles.formWrapper}>
        <h1 className={styles.formHeading}>Create Service</h1>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {step === 1 && (
          <div className={styles.formStep}>
            <h2>Basic Information</h2>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`${styles.inputField} ${errors.title ? styles.errorInput : ""}`}
              />
              {errors.title && (
                <span className={styles.errorText}>{errors.title}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${styles.inputField} ${errors.category ? styles.errorInput : ""}`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className={styles.errorText}>{errors.category}</span>
              )}
            </div>
            <button
              type="button"
              onClick={nextStep}
              className={styles.nextButton}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.formStep}>
            <h2>Description</h2>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textareaField}
                required
              ></textarea>
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={prevStep}
                className={styles.prevButton}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className={styles.nextButton}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.formStep}>
            <h2>Pricing</h2>
            <div className={styles.formGroup}>
              <label htmlFor="startingPrice">Starting Price:</label>
              <input
                type="number"
                id="startingPrice"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={prevStep}
                className={styles.prevButton}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className={styles.nextButton}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.formStep}>
            <h2>Images</h2>
            <div className={styles.formGroup}>
              <label htmlFor="images">Upload Images (Max 5):</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageUpload}
                className={styles.inputField}
                multiple
                accept="image/*"
              />
            </div>
            <div className={styles.imagePreview}>
              {formData.images.map((image, index) => (
                <div key={index} className={styles.imageContainer}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeImageButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={prevStep}
                className={styles.prevButton}
              >
                Previous
              </button>
              <button type="submit" className={styles.submitButton}>
                Create Service
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateServicePage;
