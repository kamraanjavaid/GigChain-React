import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import styles from "./styles/editService.module.scss";

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

const EditServicePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = currentUser._id || currentUser.id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    category: "",
    images: [],
    currentUser: currentUserId,
  });

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/${serviceId}`
        );

        const serviceData = response.data.service;
        setFormData({
          title: serviceData.title,
          description: serviceData.description,
          startingPrice: serviceData.startingPrice,
          category: serviceData.category,
          images: [],
        });
        setExistingImages(serviceData.images || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching service:", error);
        setErrors({ fetch: "Error loading service data" });
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId]);

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
        if (formData.images.length === 0 && existingImages.length === 0) {
          stepErrors.images = "At least one image is required";
        }
        break;

      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
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
    const totalImages =
      files.length + formData.images.length + existingImages.length;

    if (totalImages > 5) {
      setErrors((prev) => ({ ...prev, images: "Maximum 5 images allowed" }));
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Some files were rejected. Images must be under 5MB",
      }));
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles].slice(
        0,
        5 - existingImages.length
      ),
    }));

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }
  };

  const removeExistingImage = async (imageUrl) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/services/${serviceId}/image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { imageUrl },
        }
      );
      setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    } catch (error) {
      console.error("Error removing image:", error);
      setErrors((prev) => ({ ...prev, images: "Error removing image" }));
    }
  };

  const removeNewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i = 1; i <= 4; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "images") {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      const token = localStorage.getItem("token");
      const response = await axios({
        method: "put",
        url: `${import.meta.env.VITE_API_URL}/api/services/${serviceId}`,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.service) {
        navigate(`/service/${serviceId}`);
      }
    } catch (error) {
      setErrors({ submit: "Error updating service. Please try again." });
      console.error("Error updating service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.parentWrapper}>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className={styles.formWrapper}
      >
        <h1 className={styles.formHeading}>Edit Service</h1>
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
              onClick={() => setStep(2)}
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
              <label>Existing Images:</label>
              <div className={styles.imagePreview}>
                {existingImages.map((imageUrl, index) => (
                  <div key={index} className={styles.imageContainer}>
                    <img src={imageUrl} alt={`Existing ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageUrl)}
                      className={styles.removeImageButton}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <label htmlFor="images">Upload New Images:</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageUpload}
                className={styles.inputField}
                multiple
                accept="image/*"
              />
              {errors.images && (
                <span className={styles.errorText}>{errors.images}</span>
              )}

              <div className={styles.imagePreview}>
                {formData.images.map((image, index) => (
                  <div key={index} className={styles.imageContainer}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className={styles.removeImageButton}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={styles.prevButton}
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? "Updating..." : "Update Service"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditServicePage;
