# Frontend Image Upload Integration

## Overview

The admin Services form now supports real image uploads to Cloudinary through the backend API.

## How It Works

### 1. User Selects Image

When a user selects an image in the ServiceForm:

1. File is validated (type and size)
2. Local preview is created using `URL.createObjectURL()`
3. File object is stored in form state for later upload

### 2. Service is Saved

When the form is submitted:

1. Service data is sent to backend (without the file)
2. Backend creates/updates the service record
3. If a new image was selected, FormData is created with the file
4. Image is uploaded to `/api/services/:id/upload-image`
5. Backend uploads to Cloudinary and updates service record

### 3. Display Updated Service

After save completes:

1. Service list is refreshed
2. Image URL from Cloudinary is displayed
3. Old local preview URL is cleaned up

## Code Flow

### ServiceForm.jsx (No changes needed)

```jsx
const handleImageChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validation
  if (!file.type.startsWith("image/")) {
    setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
    return;
  }

  // Upload creates local preview
  const uploadedImage = await uploadImage(file, { alt: formData.name });
  setFormData((prev) => ({ ...prev, image: uploadedImage }));
};
```

### Services.jsx (Updated)

```jsx
const handleSave = async (serviceData) => {
  // Extract file from service data
  const imageFile = serviceData.image?.file;
  const serviceDataToSend = { ...serviceData };

  // Remove local preview data
  if (serviceDataToSend.image?.provider === "local-preview") {
    delete serviceDataToSend.image;
  }

  // 1. Save service
  const response = await api[method](url, serviceDataToSend);
  const savedService = response.data;

  // 2. Upload image if new file selected
  if (imageFile && imageFile instanceof File) {
    const formData = new FormData();
    formData.append("image", imageFile);

    await api.post(`/services/${savedService._id}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // 3. Refresh list
  await loadData();
};
```

### useImageUpload.js (Updated)

```jsx
export function useImageUpload() {
  const uploadImage = useCallback(async (file, options = {}) => {
    const dimensions = await getImageDimensions(file);
    const previewUrl = URL.createObjectURL(file);

    return {
      provider: "local-preview",
      file: file, // Store file for later upload
      url: previewUrl, // Local preview URL
      alt: options.alt || file.name,
      width: dimensions.width,
      height: dimensions.height,
    };
  }, []);

  return { uploadImage, isUploading, progress, error, reset };
}
```

## API Endpoints Used

### POST /api/services/:id/upload-image

Uploads image to Cloudinary after service is created.

**Request:**

```
Content-Type: multipart/form-data
Body: image=<file>
```

**Response:**

```json
{
  "ok": true,
  "message": "Image uploaded successfully",
  "image": {
    "provider": "cloudinary",
    "id": "beauty-salon/services/abc123",
    "url": "https://res.cloudinary.com/.../image.jpg",
    "alt": "Service Name",
    "width": 1200,
    "height": 800
  }
}
```

## Error Handling

### Client-Side Validation

- File type must be image/\*
- File size must be < 5MB
- Shows error message if validation fails

### Upload Errors

- Service saves successfully even if image upload fails
- User is notified with alert: "Service saved, but image upload failed"
- They can edit the service again to retry image upload

### Network Errors

- Axios automatically handles network errors
- Error messages are displayed in the form
- User can retry the operation

## File Size Recommendations

**Recommended image sizes:**

- Main service image: 1200x800px or 16:9 ratio
- File size: < 2MB for best performance
- Format: JPG for photos, PNG for graphics with transparency

**Cloudinary automatically optimizes:**

- Creates multiple sizes for responsive images
- Converts to WebP when browser supports it
- Adds CDN caching for fast delivery

## Gallery Images (Future Enhancement)

To add gallery image support:

1. Add gallery file input to ServiceForm
2. Store multiple files in form state
3. After service save, upload each file:
   ```jsx
   const formData = new FormData();
   galleryFiles.forEach((file) => {
     formData.append("images", file);
   });
   await api.post(`/services/${serviceId}/upload-gallery`, formData);
   ```

## Testing Checklist

- [ ] Create new service with image
- [ ] Edit existing service, keep old image
- [ ] Edit existing service, replace image
- [ ] Try uploading non-image file (should show error)
- [ ] Try uploading file > 5MB (should show error)
- [ ] Test with slow network (upload should complete)
- [ ] Verify old Cloudinary image is deleted when replaced
- [ ] Check image displays correctly in services list
- [ ] Verify image URL is from Cloudinary (not blob:)

## Troubleshooting

### Image not uploading

1. Check Cloudinary credentials in backend `.env`
2. Check backend logs for Cloudinary errors
3. Verify `uploads/` directory exists with write permissions
4. Test Cloudinary connection: `npm test cloudinary`

### Image shows as blob: URL

- This means the Cloudinary upload failed
- Check browser console for errors
- Service was saved but image upload step failed
- Edit the service again to retry upload

### "Cannot read properties of undefined"

- Check that `api.post` includes `Content-Type: multipart/form-data` header
- Verify FormData is being created correctly
- Check that file object exists before upload

## Future Improvements

1. **Progress Bar**: Show upload progress to user
2. **Image Cropping**: Allow users to crop before upload
3. **Multiple Images**: Support gallery uploads in one go
4. **Drag & Drop**: Add drag-and-drop file upload
5. **Image Preview Grid**: Show thumbnails of uploaded images
6. **Delete Confirmation**: Confirm before deleting images from Cloudinary
